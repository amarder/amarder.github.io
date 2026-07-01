---
title: "Ghost Spam Signups Suck"
publishDate: "2026-06-24"
description: "A summary of newsletter bombing and fake Ghost subscriber signups — what it is, why it happens, and how to mitigate it."
---

Small Ghost blogs start gaining subscribers with corporate email addresses who instantly open and click every link when a post goes out. This is automated abuse — not organic growth — and it harms both the blog owner and the people signed up without consent.

## the problem

Two overlapping patterns target Ghost's `/members/api/send-magic-link/` endpoint. Ghost rate-limits it, which helps a little, but there is no CAPTCHA — and bots rotating IPs can still abuse it at scale.

**Newsletter bombing.** Bots sign a victim's address up to hundreds of newsletters at once, flooding their inbox with confirmation emails to bury a real security alert (password change, suspicious login, wire transfer). Your blog is ammunition, not the target.

**Email validation for phishing.** Bots sign up addresses and check whether they convert to confirmed members — often after probing the login flow first. Confirmed signups mean an active address: prime phishing targets.

The confusing symptom — **instant opens and clicks from "subscribers" who never read your content** — is often corporate email security (Proofpoint, Mimecast, Barracuda, Safe Links) pre-fetching magic-link confirmation URLs. Scanners look like engaged readers; opens and clicks are not proof of a real person.

**Cost to you:** inflated member lists, damaged sender reputation, and unknowingly spamming victims. Ghost Explore makes site discovery easier, but the root issue is a signup API with minimal protections.

## partial solutions

No single fix exists. Ghost's built-in rate limit is a start; community mitigations are layered and imperfect.

**Stop bots before email is sent** — the only approach that also protects bombing victims (harm happens at send time):

- CAPTCHA or Cloudflare Turnstile on the signup path
- Cloudflare WAF blocking Tor (`T1`)
- `verifyRequestIntegrity: true` in Ghost config
- Tighter rate limits at your reverse proxy (Traefik, Caddy, Nginx)
- Prevent CDN bypass: restrict origin to Cloudflare IPs, use a Tunnel, or set `hostSettings.siteId` with an `x-site-id` header via Cloudflare transform rules

**Fix confirmation flow:** replace one-click GET magic links with a confirm button or one-time code — stops scanners auto-confirming, but does not prevent emails from being sent. Ghost 6.17+ stopped leaking whether an email is already a member on login; abuse has continued regardless.

**Operational:** go invite-only; prune suspicious members; don't trust engagement metrics; separate transactional and newsletter SMTP; monitor bounces/complaints via webhooks.

Ghost still needs stronger platform-level bot protection, optional manual approval, and signup one-time codes. Until then, expect to periodically remove corporate emails from your list.

## my approach

My newsletter is super small. I decided to take the nuclear option and go invite-only. When someone submits their email address to subscribe on my site, I get notified, I contact them manually to confirm that they do in fact want to subscribe, and then I personally add them to the subscriber list. This approach makes sense for me right now, because I didn't want to spend time playing a game of layered whack-a-mole.

## references

- [Magic Pages: How to stop spam signups on your Ghost membership site](https://www.magicpages.co/blog/how-to-stop-spam-signups-on-your-ghost-membership-site/)
- [Discussion on Reddit](https://www.reddit.com/r/Ghost/comments/1u99o59/fake_subscribers/)
- [Discussion on Ghost Forum](https://forum.ghost.org/t/observations-about-spam-signups/61475)
