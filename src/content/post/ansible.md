---
title: An Ansible Playbook for a Secure VPS
publishDate: "2026-03-09"
description: ""
---

:::note{title="Note"}
This is a work in progress. I haven't fully vetted this post yet.
:::

I had been wanting a simple checklist for setting up a secure VPS. This [Reddit post](https://www.reddit.com/r/selfhosted/comments/1rob0cj/comment/o9gw9u4/) gave me a great starting point. One comment asked why not create an Ansible playbook to automate the checklist and I thought that sounded like an awesome idea. Here's a first draft of an Ansible playbook created by Claude. Please let me know if you'd make any modifications (I haven't had a chance to try it yet).

```yaml
- name: Secure a fresh VPS
  hosts: all
  become: true
  vars:
    username: deploy
    ssh_port: 22

  tasks:

    # ── System updates ──────────────────────────────────────────────

    - name: Update apt cache and upgrade all packages
      apt:
        update_cache: true
        upgrade: dist
        autoremove: true

    # ── User setup ──────────────────────────────────────────────────

    - name: Create non-root user with sudo
      user:
        name: "{{ username }}"
        groups: sudo
        shell: /bin/bash
        create_home: true

    - name: Allow passwordless sudo for the new user
      copy:
        dest: "/etc/sudoers.d/{{ username }}"
        content: "{{ username }} ALL=(ALL) NOPASSWD:ALL\n"
        mode: "0440"
        validate: "visudo -cf %s"

    - name: Copy authorized_keys from root to new user
      authorized_key:
        user: "{{ username }}"
        key: "{{ lookup('file', '~/.ssh/id_ed25519.pub') }}"

    # ── SSH hardening ───────────────────────────────────────────────

    - name: Harden sshd_config
      lineinfile:
        path: /etc/ssh/sshd_config
        regexp: "{{ item.regexp }}"
        line: "{{ item.line }}"
      loop:
        - { regexp: '^#?PermitRootLogin',        line: 'PermitRootLogin no' }
        - { regexp: '^#?PasswordAuthentication',  line: 'PasswordAuthentication no' }
        - { regexp: '^#?KbdInteractiveAuthentication', line: 'KbdInteractiveAuthentication no' }
        - { regexp: '^#?X11Forwarding',           line: 'X11Forwarding no' }
        - { regexp: '^#?MaxAuthTries',            line: 'MaxAuthTries 3' }
        - { regexp: '^#?Port ',                   line: 'Port {{ ssh_port }}' }
      notify: Restart sshd

    # ── Firewall (ufw) ─────────────────────────────────────────────

    - name: Install ufw
      apt:
        name: ufw
        state: present

    - name: Set ufw defaults (deny incoming, allow outgoing)
      community.general.ufw:
        direction: "{{ item.direction }}"
        policy: "{{ item.policy }}"
      loop:
        - { direction: incoming, policy: deny }
        - { direction: outgoing, policy: allow }

    - name: Allow SSH through ufw
      community.general.ufw:
        rule: allow
        port: "{{ ssh_port | string }}"
        proto: tcp

    - name: Enable ufw
      community.general.ufw:
        state: enabled

    # ── fail2ban ────────────────────────────────────────────────────

    - name: Install fail2ban
      apt:
        name: fail2ban
        state: present

    - name: Configure fail2ban jail for sshd
      copy:
        dest: /etc/fail2ban/jail.local
        content: |
          [sshd]
          enabled  = true
          port     = {{ ssh_port }}
          filter   = sshd
          logpath  = /var/log/auth.log
          maxretry = 5
          bantime  = 3600
          findtime = 600
      notify: Restart fail2ban

    # ── Automatic security updates ──────────────────────────────────

    - name: Install unattended-upgrades
      apt:
        name:
          - unattended-upgrades
          - apt-listchanges
        state: present

    - name: Enable unattended-upgrades
      copy:
        dest: /etc/apt/apt.conf.d/20auto-upgrades
        content: |
          APT::Periodic::Update-Package-Lists "1";
          APT::Periodic::Unattended-Upgrade "1";
          APT::Periodic::AutocleanInterval "7";

    # ── Basic logging ───────────────────────────────────────────────

    - name: Ensure rsyslog is installed and running
      apt:
        name: rsyslog
        state: present

    - name: Enable and start rsyslog
      systemd:
        name: rsyslog
        enabled: true
        state: started

    # ── Misc hardening ──────────────────────────────────────────────

    - name: Set timezone to UTC
      timezone:
        name: UTC

    - name: Install common diagnostic tools
      apt:
        name:
          - curl
          - wget
          - htop
          - net-tools
        state: present

  handlers:

    - name: Restart sshd
      systemd:
        name: sshd
        state: restarted

    - name: Restart fail2ban
      systemd:
        name: fail2ban
        state: restarted
```

**How to use it:**

1. Put the playbook in a file (e.g. `secure-vps.yaml`).
2. Create an inventory file pointing at your VPS:

```ini
[vps]
203.0.113.42 ansible_user=root
```

3. Run it:

```bash
ansible-playbook -i inventory secure-vps.yaml
```

After the first run, root SSH is disabled, so subsequent runs should target the new user:

```ini
[vps]
203.0.113.42 ansible_user=deploy
```

**What it covers from the checklist:**

| Step | How |
|---|---|
| Update the system | `apt upgrade dist` |
| Create a sudo user | `user` module + sudoers drop-in |
| Disable root login | `PermitRootLogin no` in sshd_config |
| Disable password auth | `PasswordAuthentication no` |
| Firewall | ufw: deny incoming, allow SSH |
| fail2ban | jail.local watching sshd, 5 retries then 1-hour ban |
| Auto security updates | unattended-upgrades with daily checks |
| Basic logging | rsyslog enabled |

**Things you might want to customize:**

- **`username`** — change `deploy` to whatever you prefer.
- **`ssh_port`** — changing from 22 to something non-standard reduces log noise from automated scanners (security through obscurity, but it does cut the noise dramatically).
- **SSH public key path** — the playbook assumes `~/.ssh/id_ed25519.pub`; adjust if you use RSA or a different key.
- **Additional ufw rules** — if you're running a web server, add rules for ports 80 and 443.
- **fail2ban tuning** — `maxretry`, `bantime`, and `findtime` are all worth adjusting based on your tolerance.
