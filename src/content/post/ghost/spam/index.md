---
title: "Newsletter Spam"
publishDate: "2026-06-24"
description: "A summary of newsletter bombing and fake Ghost subscriber signups — what it is, why it happens, and how to mitigate it."
---

Small Ghost blogs with almost no traffic suddenly gain subscribers from corporate email addresses who instantly open and click every link when a post goes out. This is automated abuse — not organic growth — and it harms both the blog owner and the people signed up without consent.

## 1. What is the problem?

Two overlapping patterns target Ghost's `/members/api/send-magic-link/` endpoint. Ghost rate-limits it, which helps a little, but there is no CAPTCHA — and bots rotating IPs can still abuse it at scale.

**Newsletter bombing.** Bots sign a victim's address up to hundreds of newsletters at once, flooding their inbox with confirmation emails to bury a real security alert (password change, suspicious login, wire transfer). Your blog is ammunition, not the target.

**Email validation for phishing.** Bots sign up addresses and check whether they convert to confirmed members — often after probing the login flow first. Confirmed signups mean an active address that clicks email links: prime phishing targets.

The confusing symptom — **instant opens and clicks from "subscribers" who never read your content** — is often corporate email security (Proofpoint, Mimecast, Barracuda, Safe Links) pre-fetching magic-link confirmation URLs. Scanners look like engaged readers; opens and clicks are not proof of a real person.

**Cost to you:** unwanted confirmation mail (and spam reports), inflated member lists, damaged sender reputation, and in bombing scenarios, unknowingly spamming victims. Ghost Explore makes site discovery easier, but the root issue is a signup API with only partial protection.

## 2. Who is doing this / why are they doing it?

Automated bots at scale — Tor, VPNs, residential IPs, data centers, headless browsers — with infrastructure that rotates faster than blocklists. Motives: hide fraud alerts (**newsletter bombing**), build validated phishing lists, and occasionally tank your sender reputation as collateral.

Corporate addresses on your list (law firms, airports, AR departments, executives) are almost certainly **victims**, not readers. Blocking those domains does little.

## 3. How can the problem be addressed?

No single fix exists. Ghost's built-in rate limit is a start; community mitigations are layered and imperfect.

**Stop bots before email is sent** — the only approach that also protects bombing victims (harm happens at send time):

- CAPTCHA or Cloudflare Turnstile on the signup path
- Cloudflare WAF blocking Tor (`T1`)
- `verifyRequestIntegrity: true` in Ghost config
- Tighter rate limits at your reverse proxy (Traefik, Caddy, Nginx)
- Prevent CDN bypass: restrict origin to Cloudflare IPs, use a Tunnel, or set `hostSettings.siteId` with an `x-site-id` header via Cloudflare transform rules

**Fix confirmation flow:** replace one-click GET magic links with a confirm button or one-time code — stops scanners auto-confirming, but does not prevent emails from being sent. Ghost 6.17+ stopped leaking whether an email is already a member on login; abuse has continued regardless.

**Operational:** go invite-only; prune suspicious members (back up first, whitelist yourself); don't trust engagement metrics; separate transactional and newsletter SMTP; monitor bounces/complaints via webhooks.

Ghost still needs stronger platform-level bot protection, optional manual approval, and signup one-time codes. Until then, expect to periodically remove fake Fortune 500 CEOs from your list.

---

Sources: [Reddit r/Ghost discussion](https://www.reddit.com/r/Ghost/), [pro-it.rocks field guide to newsletter bombing](https://pro-it.rocks/why-a-fortune-500-ceo-just-subscribed-to-my-blog-about-a-40-year-old-unix-spoiler-they-did-not/), [Ghost forum — Observations about spam signups](https://forum.ghost.org/t/observations-about-spam-signups/).
