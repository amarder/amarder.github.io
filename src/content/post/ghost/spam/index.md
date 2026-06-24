---
title: "Newsletter Spam"
publishDate: "2026-06-24"
description: "A summary of newsletter bombing and fake Ghost subscriber signups — what it is, why it happens, and how to mitigate it."
---

Ghost newsletter signups are being abused at scale. Small blogs with almost no traffic suddenly accumulate subscribers from corporate email addresses who immediately open and click every link when a post goes out. This is not organic growth — it is automated abuse that harms both the blog owner and the people whose addresses were signed up without consent.

## 1. What is the problem?

There are two overlapping abuse patterns, both targeting Ghost's `/members/api/send-magic-link/` signup endpoint. Ghost rate-limits this endpoint, which helps a little, but there is no CAPTCHA or other bot challenge — and distributed bots rotating IPs can still overwhelm a single-site limit over time.

**Newsletter bombing (list bombing).** Bots submit someone else's email address to hundreds or thousands of newsletter signup forms in minutes. The victim's inbox floods with "Confirm your subscription" emails, burying a single legitimate security alert — a password change, suspicious login, or wire transfer — that the attacker needs the victim to miss. Your blog is not the target; it is ammunition. Each signup form contributes one or two confirmation emails to someone else's catastrophe.

**Email validation for phishing.** A separate but related pattern: bots sign up random email addresses and observe whether the address converts to a confirmed member. Attackers often try the login flow first (`No member exists`), then submit a signup for the same address. If the victim clicks the confirmation link, the attacker learns the address is active and that the owner clicks links in email — valuable intelligence for targeted phishing. Some signups never confirm; others do, because corporate email security appliances automatically visit every link in inbound mail.

That last mechanism explains the most confusing symptom: **confirmed subscribers who never read your content but click everything instantly.** Platforms like Proofpoint, Mimecast, Barracuda, and Microsoft Safe Links pre-fetch links in email before a human sees them. A GET request to a magic-link confirmation URL looks identical to an enthusiastic new reader. Security scanners generate opens and clicks, so engagement metrics are not proof of a real person.

The collateral damage for blog owners is real:

- Unwanted confirmation emails sent to strangers, some of whom report them as spam
- Inflated member lists full of corporate addresses unrelated to your topic
- Damaged sender reputation and deliverability if abuse volume is high enough
- In the bombing scenario, you are unknowingly spamming victims whose inboxes you helped flood

Ghost Explore and other public directories make it easy for bots to collect Ghost site URLs, but the underlying issue is an easily abused signup API with only partial protection — not discovery alone.

## 2. Who is doing this / why are they doing it?

The actors are automated bots operating at scale, not individual people interested in your writing. Traffic comes from Tor exit nodes, VPNs, residential IPs, data-center ASNs, and increasingly headless browsers that load pages like real visitors. Infrastructure rotates quickly — block one region or ASN and the same behavior reappears elsewhere the same day.

Motivations fall into three categories:

1. **Newsletter bombing** — hide a critical security email in a flood of subscription confirmations during account takeover or fraud.
2. **Email list building for phishing** — confirm which addresses are active and which owners click links, then target them.
3. **Sender reputation attack (secondary)** — if enough unwanted mail from your domain gets marked as spam, your newsletter deliverability can tank as collateral damage.

The corporate email addresses appearing on your member list — law firms, airports, accounts receivable departments, Fortune 500 executives — are almost certainly **victims**, not readers. The attacker collected or guessed their addresses and used your signup form as a delivery mechanism. Blocking those domains does little; the domains belong to innocent third parties.

## 3. How can the problem be addressed?

There is no single platform-level fix yet. Ghost's built-in rate limiting on the magic-link endpoint is a start but not enough on its own against coordinated, IP-rotating automation. Community mitigations are layered and imperfect. What actually helps depends on whether you self-host and what infrastructure you control.

### Stop bots before email is sent

This is the only approach that helps both you and the bombing victim, because the harm happens at send time, not confirm time.

- **CAPTCHA or Cloudflare Turnstile** on the signup path — a managed challenge on `/members/api/send-magic-link/` stops automated submission cold.
- **Cloudflare WAF** — block Tor exit nodes (country code `T1`); many hosts report this blocked the initial wave.
- **`verifyRequestIntegrity: true`** in Ghost config — forces callers to obtain an integrity token before hitting the magic-link endpoint, raising the cost of direct API abuse.
- **Additional rate limiting** at the reverse proxy (Traefik, Caddy, Nginx) on the signup endpoint — tighter than Ghost's defaults, e.g. a few POSTs per hour per IP. Useful when bots stay under Ghost's limit by spreading requests across addresses or timing.
- **Prevent CDN bypass** — bots may hit your origin IP directly, skipping Cloudflare entirely. Restrict ports 80/443 to Cloudflare IP ranges, use a Cloudflare Tunnel, or set `hostSettings.siteId` and require a matching `x-site-id` header injected by a Cloudflare transform rule so direct-to-origin requests fail.

### Fix the confirmation flow

Changing confirmation from a one-click GET magic link to a page with a button (or one-time code entered in the same browser session) prevents security scanners from auto-confirming subscriptions. This cleans up your list but **does not stop confirmation emails from being sent** in the first place — you still need a signup challenge for that.

Ghost 6.17+ reduced information leakage on login (no longer revealing whether an email is already a member), which may discourage email-validation attacks over time if that was the primary motive. Reports suggest abuse continued after that release.

### Operational responses

- **Go invite-only** — ends abuse immediately at the cost of organic signups. Several affected bloggers chose this, including manually vetting subscribers via email.
- **Watch and prune** — remove suspicious members: corporate domains unrelated to your audience, zero plausible engagement, signups that cluster in time. Back up rows before bulk delete. Whitelist yourself and known real readers first — corporate-domain filters can catch your own admin address.
- **Do not trust opens/clicks as proof of humanity** — security appliances generate both.
- **Separate transactional and newsletter email** — if signup abuse tarnishes transactional SMTP reputation, keep newsletter sending on a provider whose reputation you cannot afford to lose.
- **Monitor bounces and complaints** — set up webhooks from your mail provider; Mailgun does not always alert proactively when failure rates spike.

### What Ghost still needs

Community consensus is that this should be a **platform concern**: stronger bot protection beyond the existing endpoint rate limit, optional manual signup approval, and one-time codes instead of magic links for signup confirmation. Until then, running an open signup form means periodically escorting fake Fortune 500 CEOs off your member list — and accepting that you may have been an unwitting participant in someone else's inbox attack.

---

Sources: [Reddit r/Ghost discussion](https://www.reddit.com/r/Ghost/), [pro-it.rocks field guide to newsletter bombing](https://pro-it.rocks/why-a-fortune-500-ceo-just-subscribed-to-my-blog-about-a-40-year-old-unix-spoiler-they-did-not/), [Ghost forum — Observations about spam signups](https://forum.ghost.org/t/observations-about-spam-signups/).
