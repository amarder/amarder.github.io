---
title: "Self-Hosting an Email Newsletter"
description: "How I'm hosting my new newsletter for free"
publishDate: "2025-12-08"
updatedDate: "2026-02-21"
posse:
  - "[Reddit](https://www.reddit.com/r/selfhosted/comments/1pi53gf/selfhosting_a_newsletter_and_mailing_list_manager/)"
---

:::warning{title=Deprecated}
I'm no longer using listmonk. I'm now self-hosting [Ghost](/ghost) on [Hetzner](/hetzner).
:::

My friend [Cory](https://www.coryzue.com/) asked if there was a way to subscribe to blog updates via email.
Now I can proudly say: Yes, I have a newsletter!
If you'd like to receive a weekly email with blog updates, fill out the form at the bottom of this page.

Cory uses [EmailOctopus](https://emailoctopus.com/) to send his newsletter.
I probably should have copied him, but I'm super frugal and didn't want to spend $10 per month.
I've set up my newsletter using:

1. [listmonk](https://github.com/knadh/listmonk) on my home server
2. [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/) exposing listmonk to the web
3. [Mailgun](https://www.mailgun.com/) to send emails via SMTP[^1]

[^1]: Initially, I sent emails via Proton Mail's SMTP, but it wasn't working smoothly. I've switched to Mailgun, which lets me send up to 100 emails a day for free.

This costs me $0 per month!
I think listmonk is very good, but the signup process for new subscribers is a little clunky.
I might try [Keila](https://github.com/pentacent/keila/) next (it looks a bit smoother than listmonk, though less mature).

## Double vs Single Opt-In

I found listmonk's double opt-in process confusing. When a user tried to subscribe, they would receive a confirmation email. However, pressing the blue "Confirm subscription" button in the email didn't immediately confirm their subscription. Instead, it redirected them to a website where they had to submit another form. I would have preferred the button to directly confirm the subscription without this extra step. Since I couldn't find a way to achieve that behavior with listmonk, I've switched to a single opt-in process.

## CORS Configuration

CORS (Cross-Origin Resource Sharing) is a browser security feature that restricts web pages from making requests to a different "origin" than the one that served the page. An origin is defined by the combination of protocol, host, and port - so `andrewmarder.net` and `newsletter.andrewmarder.net` are considered different origins, even though they're subdomains of the same domain.

If you're using a Cloudflare Tunnel to expose listmonk and want your subscription form to work via JavaScript `fetch()` requests, you'll need to configure CORS headers. Without this, browsers will block the response - both in local development and in production.

In your Cloudflare dashboard, select the domain you want to modify, then go to **Rules → Overview → Create rule → Response Header Transform Rule**:

- **When:** Hostname equals your listmonk domain (e.g., `newsletter.yourdomain.com`)
- **Then:** Set these static response headers:

| Header name | Value |
|-------------|-------|
| `Access-Control-Allow-Origin` | `*` |
| `Access-Control-Allow-Methods` | `POST, GET, OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type` |

I used `*` for the allowed origin so the form works in both production and local development. This approach seems acceptable for a public subscription endpoint, but I'm not thrilled with opening things up to every origin.
