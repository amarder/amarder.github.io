---
title: "Self-Hosting an Email Newsletter with Keila"
description: "A step-by-step guide to self-hosting Keila with Docker Compose and Cloudflare Tunnel."
publishDate: 2026-02-10
---

I want to self-host an email newsletter. This post gives instructions on how to set up [Keila](https://www.keila.io/) on a home server, exposing it to the internet with a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/). These instructions aim to be (1) easy to follow and (2) reasonably secure.

## Prerequisites

- A Linux machine with [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed
- A domain name managed by [Cloudflare](https://www.cloudflare.com/)
- An SMTP provider for sending emails (e.g. [Mailgun](https://www.mailgun.com/), [Amazon SES](https://aws.amazon.com/ses/), [Postmark](https://postmarkapp.com/))

## 1. Create a Cloudflare Tunnel

Before setting up Keila, create a tunnel in Cloudflare's dashboard:

1. Go to the [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Networks** → **Tunnels** → **Create a tunnel**
3. Choose **Cloudflared** as the connector type
4. Name your tunnel (e.g. `keila`)
5. Copy the tunnel token — you'll need it for the `docker-compose.yml` below
6. Add a **Public Hostname**:
   - Subdomain: `newsletter` (or whatever you prefer)
   - Domain: your domain
   - Service Type: `HTTP`
   - URL: `keila:4000`

## 2. Create docker-compose.yml

Create a project directory and add a `docker-compose.yml` file:

```bash
mkdir keila && cd keila
```

Create a `.env` file with your secrets:

```bash
# Generate a secret key
echo "SECRET_KEY_BASE=$(head -c 48 /dev/urandom | base64)" >> .env

# Add your other secrets
echo "POSTGRES_PASSWORD=$(head -c 24 /dev/urandom | base64)" >> .env
echo "TUNNEL_TOKEN=your-cloudflare-tunnel-token" >> .env
echo "URL_HOST=newsletter.yourdomain.com" >> .env

# SMTP configuration
echo "MAILER_SMTP_HOST=smtp.mailgun.org" >> .env
echo "MAILER_SMTP_USER=your-smtp-user" >> .env
echo "MAILER_SMTP_PASSWORD=your-smtp-password" >> .env
echo "MAILER_SMTP_FROM_EMAIL=newsletter@yourdomain.com" >> .env
```

Then create `docker-compose.yml`:

```yaml
services:
  keila:
    image: pentacent/keila:latest
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB_URL: "postgres://keila:${POSTGRES_PASSWORD}@postgres/keila"
      SECRET_KEY_BASE: "${SECRET_KEY_BASE}"
      URL_HOST: "${URL_HOST}"
      URL_SCHEMA: "https"
      PORT: "4000"
      DISABLE_REGISTRATION: "true"
      MAILER_SMTP_HOST: "${MAILER_SMTP_HOST}"
      MAILER_SMTP_USER: "${MAILER_SMTP_USER}"
      MAILER_SMTP_PASSWORD: "${MAILER_SMTP_PASSWORD}"
      MAILER_SMTP_FROM_EMAIL: "${MAILER_SMTP_FROM_EMAIL}"
    volumes:
      - keila_uploads:/opt/app/uploads
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: keila
      POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
      POSTGRES_DB: keila
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U keila"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token ${TUNNEL_TOKEN}
    depends_on:
      - keila
    restart: unless-stopped

volumes:
  postgres_data:
  keila_uploads:
```

A few things to note:

- **No ports are exposed.** Traffic flows through the Cloudflare Tunnel, so there's no need to publish ports on the host machine. This is more secure than binding to `0.0.0.0`.
- **`DISABLE_REGISTRATION`** is set to `true`. The root user is created on first launch, and you don't want strangers registering accounts on your instance.
- **`URL_SCHEMA`** is set to `https` because Cloudflare handles TLS termination.
- **Secrets live in `.env`**, not in the compose file. Add `.env` to your `.gitignore`.

## 3. Start Keila

```bash
docker compose up -d
```

On first launch, Keila creates a root user and prints the credentials to the logs. Grab them:

```bash
docker compose logs keila | grep -A2 "root user"
```

You should see output like:

```
Created root user with email root@localhost and password <random-password>
```

You can customize the root user by setting `KEILA_USER` and `KEILA_PASSWORD` environment variables before the first launch.

## 4. Log In and Configure a Sender

1. Open `https://newsletter.yourdomain.com` in your browser
2. Log in with the root credentials from the logs
3. Go to **Senders** → **New Sender**
4. Configure your SMTP sender (Mailgun, SES, Postmark, etc.)
5. Send a test email to verify it works

## 5. Secure with Cloudflare Access

Keila's admin interface should not be open to the public internet without an additional layer of authentication. [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) adds authentication *before* traffic reaches your server.

1. In the [Zero Trust Dashboard](https://one.dash.cloudflare.com/), go to **Access** → **Applications** → **Add an application** → **Self-hosted**
2. Set the **Application domain** to your Keila subdomain
3. Create a policy that allows only your email address (e.g. Email is `you@example.com`)
4. Under **Path**, enter `/admin` (this protects the admin interface)

Add a second application or policy for `/api/*` to protect the API as well.

**Do not** protect these paths — they need to be publicly accessible for newsletters to work:

- `/unsubscribe/*` — unsubscribe links
- `/campaigns/*` — campaign view in browser
- `/forms/*` — signup forms

## 6. Keep It Updated

Periodically pull the latest images:

```bash
docker compose pull && docker compose up -d
```

Consider a calendar reminder to do this monthly.

## References

- [Keila Homepage](https://www.keila.io/)
- [Keila Source Code](https://github.com/pentacent/keila)
- [Keila Configuration Docs](https://www.keila.io/docs/configuration)
- [Example Docker Compose File](https://github.com/pentacent/keila/blob/main/ops/docker-compose.yml)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Cloudflare Access Docs](https://developers.cloudflare.com/cloudflare-one/policies/access/)