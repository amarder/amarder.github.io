---
title: "Securing Self-Hosted Apps with Cloudflare Tunnel"
publishDate: "2026-01-16"
description: "A practical guide to securing self-hosted services like listmonk behind Cloudflare Tunnel."
draft: true
---

I'm running [listmonk](https://listmonk.app/) on a computer at home and using [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) to expose it to the internet. This setup avoids opening ports on my router, but there are still important security steps to take.

**The good news**: you only need to do two things to cover 90% of your risk. Everything else is nice-to-have.

## The Two Things That Actually Matter

### 1. Change the Default Credentials

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

If you do nothing else, do this.

### 2. Set Up Cloudflare Access

[Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) adds authentication *before* traffic reaches your server. Even if someone discovers your URL or a vulnerability exists in listmonk, they can't reach it without logging in through Cloudflare first.

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Access** → **Applications** → **Add an application** → **Self-hosted**
3. Set the **Application domain** to your listmonk subdomain
4. Set **Path** to `/admin/*`
5. Create a policy that allows only your email address

Now Cloudflare prompts for authentication before anyone can reach your admin panel. This is the single most impactful security improvement you can make.

**Important**: Don't protect these paths (they need to be public for emails to work):
- `/subscription/*` - subscribe/unsubscribe links
- `/link/*` - tracked links in emails

---

## Everything Else (Nice to Have)

The steps below add defense in depth. They're worth doing if you have time, but they're not critical if you've done the two things above.

### Keep Software Updated

Periodically pull the latest images:

```bash
docker compose pull && docker compose up -d
```

Enable automatic security updates on your host OS.

### Protect API Endpoints

Add another Cloudflare Access rule for `/api/*` with the same policy. This prevents unauthorized API access.

### Enable WAF

In Cloudflare's dashboard: **Security** → **WAF** → Enable the managed ruleset. This blocks common attack patterns automatically.

### Bind to Localhost

The default `docker-compose.yml` listens on `0.0.0.0:9000`. If cloudflared runs on the same machine, change it to only accept local connections:

```yaml
environment:
  LISTMONK_app__address: 127.0.0.1:9000  # Was 0.0.0.0:9000
```

### Backups

Set up automated PostgreSQL backups and test that you can restore from them.

---

## Quick Reference

| Priority | Action | Time |
|----------|--------|------|
| **Essential** | Change default credentials (admin + database) | 5 minutes |
| **Essential** | Set up Cloudflare Access for `/admin/*` | 10 minutes |
| Nice to have | Protect `/api/*` with Access | 5 minutes |
| Nice to have | Enable WAF | 2 minutes |
| Nice to have | Bind to localhost | 2 minutes |
| Nice to have | Set up backups | 30 minutes |

## Resources

- [listmonk docker-compose.yml](https://github.com/knadh/listmonk/blob/master/docker-compose.yml)
- [listmonk Documentation](https://listmonk.app/docs/)
- [Cloudflare Access Documentation](https://developers.cloudflare.com/cloudflare-one/policies/access/)
