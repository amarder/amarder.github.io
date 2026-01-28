---
title: "Securing Self-Hosted Apps with Cloudflare Tunnel"
publishDate: "2026-01-23"
description: "A practical guide to securing self-hosted services like listmonk behind Cloudflare Tunnel."
draft: true
---

I'm running [listmonk](https://listmonk.app/) on a computer at home and using [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) to expose it to the internet. This setup avoids opening ports on my router, but there are still important security steps to take.

## Security Checklist

| | Task | Value | Time |
|---|------|-------|------|
| ☐ | [Change default credentials](#1-change-default-credentials) | 🔴 Critical — bots actively scan for defaults | ~5 min |
| ☐ | [Set up Cloudflare Access](#2-set-up-cloudflare-access) | 🔴 Critical — blocks attacks before they reach your server | ~10 min |
| ☐ | [Protect API endpoints](#3-protect-api-endpoints) | 🟡 Medium — prevents unauthorized API access | ~5 min |
| ☐ | [Enable WAF](#4-enable-waf) | 🟡 Medium — blocks common attack patterns | ~2 min |
| ☐ | [Bind to localhost](#5-bind-to-localhost) | 🟢 Low — defense in depth if tunnel is bypassed | ~2 min |
| ☐ | [Keep software updated](#6-keep-software-updated) | 🟢 Low — patches known vulnerabilities over time | ~5 min |
| ☐ | [Set up backups](#7-set-up-backups) | 🟢 Low — recovery from data loss, not security | ~30 min |

**The first two items cover ~90% of your risk.** Everything else is defense in depth.

---

## Critical Steps

### 1. Change Default Credentials

> ⏱️ ~5 minutes · 🔴 Critical

The [default docker-compose.yml](https://github.com/knadh/listmonk/blob/master/docker-compose.yml) ships with `listmonk` as the database username, password, and database name. Bots actively scan for default credentials.

**Option A**: Set credentials via environment variables before first run:

```bash
export LISTMONK_ADMIN_USER=your-admin-username
export LISTMONK_ADMIN_PASSWORD=your-strong-password
docker compose up -d
```

**Option B**: If you've already started listmonk, change the admin password in the web UI:

1. Log in at `http://localhost:9000`
2. Go to **Settings** → **General**
3. Change the username and password

Either way, also update the database password in your `docker-compose.yml`:

```yaml
x-db-credentials: &db-credentials
  POSTGRES_USER: &db-user listmonk
  POSTGRES_PASSWORD: &db-password your-strong-db-password  # Change this!
  POSTGRES_DB: &db-name listmonk
```

### 2. Set Up Cloudflare Access

> ⏱️ ~10 minutes · 🔴 Critical

[Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) adds authentication *before* traffic reaches your server. Even if someone discovers your URL or a vulnerability exists in listmonk, they can't reach it without logging in through Cloudflare first.

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Access** → **Applications** → **Add an application** → **Self-hosted**
3. Set the **Application domain** to your listmonk subdomain
4. Set **Path** to `/admin/*`
5. Create a policy that allows only your email address

**Important**: Don't protect these paths (they need to be public for emails to work):
- `/subscription/*` — subscribe/unsubscribe links
- `/link/*` — tracked links in emails

---

## Recommended Steps

### 3. Protect API Endpoints

> ⏱️ ~5 minutes · 🟡 Medium

Add another Cloudflare Access rule for `/api/*` with the same policy. This prevents unauthorized API access even if someone has a valid API key.

### 4. Enable WAF

> ⏱️ ~2 minutes · 🟡 Medium

In Cloudflare's dashboard: **Security** → **WAF** → Enable the managed ruleset. This blocks common attack patterns (SQL injection, XSS, etc.) automatically.

---

## Optional Steps

### 5. Bind to Localhost

> ⏱️ ~2 minutes · 🟢 Low

The default `docker-compose.yml` listens on `0.0.0.0:9000`. If cloudflared runs on the same machine, change it to only accept local connections:

```yaml
environment:
  LISTMONK_app__address: 127.0.0.1:9000  # Was 0.0.0.0:9000
```

This only matters if someone bypasses Cloudflare Tunnel entirely (unlikely if you haven't opened ports on your router).

### 6. Keep Software Updated

> ⏱️ ~5 minutes to set up · 🟢 Low

Periodically pull the latest images:

```bash
docker compose pull && docker compose up -d
```

Consider setting a calendar reminder to do this monthly. Also enable automatic security updates on your host OS.

### 7. Set Up Backups

> ⏱️ ~30 minutes · 🟢 Low

Set up automated PostgreSQL backups and test that you can restore from them. This protects against data loss rather than security breaches, but it's still important.

---

## Resources

- [listmonk docker-compose.yml](https://github.com/knadh/listmonk/blob/master/docker-compose.yml)
- [listmonk Documentation](https://listmonk.app/docs/)
- [Cloudflare Access Documentation](https://developers.cloudflare.com/cloudflare-one/policies/access/)
