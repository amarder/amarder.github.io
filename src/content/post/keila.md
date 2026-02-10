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
2. Navigate to **Networks** → **Connectors** → **Create a tunnel**
3. Choose **Cloudflared** as the connector type
4. Name your tunnel (e.g. `keila`)
5. Copy the tunnel token — you'll need it for the `.env` file below
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

# User credentials to login to Keila
echo "KEILA_USER=you@example.com" >> .env
echo "KEILA_PASSWORD=$(head -c 24 /dev/urandom | base64)" >> .env
```

NOTE: I like using `/dev/urandom | base64` to create random passwords but it can create passwords with unfortunate special characters. For instance, my first `POSTGRES_PASSWORD` had a `/` in it, which created problems when trying to setup the database. I regenerated the password to make sure it didn't contain a forward slash.

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
      KEILA_USER: "${KEILA_USER}"
      KEILA_PASSWORD: "${KEILA_PASSWORD}"
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

On first launch, Keila creates a root user using the `KEILA_USER` and `KEILA_PASSWORD` values from your `.env` file. To retrieve your generated password:

```bash
grep KEILA_PASSWORD .env
```

## 4. Log In and Configure a Sender

1. Open `https://newsletter.yourdomain.com` in your browser
2. Log in with the `KEILA_USER` and `KEILA_PASSWORD` credentials from above
3. Create a new project
4. Inside your new project, go to **Senders** → **Create**
5. Configure your SMTP sender (Mailgun, SES, Postmark, etc.)
6. Send a test email to verify it works (I had to create a new campaign and send a preview email)

## 5. Secure with Cloudflare Access

Keila's admin interface should not be open to the public internet without an additional layer of authentication. [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) adds authentication *before* traffic reaches your server.

1. In the [Zero Trust Dashboard](https://one.dash.cloudflare.com/), go to **Access controls** → **Applications** → **Add an application** → **Self-hosted**
2. Set the **Application domain** to your Keila subdomain
3. Create a policy that allows only your email address (e.g. Email is `you@example.com`)
4. Under **Path**, enter `/auth*` (this protects the login page so only you can authenticate with Keila)

Add a second public hostname for `/api*` to protect the API as well.

Public-facing paths like `/unsubscribe/*`, `/campaigns/*`, and `/forms/*` should remain unprotected so newsletter links and signup forms continue to work.

## 6. Keep It Updated

I like using [dockcheck](https://github.com/mag37/dockcheck) to periodically pull the latest images. I should (but have not) set up a calendar reminder to do this monthly.

## References

- [Keila Homepage](https://www.keila.io/)
- [Keila Source Code](https://github.com/pentacent/keila)
- [Keila Configuration Docs](https://www.keila.io/docs/configuration)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Cloudflare Access Docs](https://developers.cloudflare.com/cloudflare-one/policies/access/)