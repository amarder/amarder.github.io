---
title: "Hetzner: VPS $4.10 per Month"
publishDate: "2026-02-16"
description: "A single-node Kubernetes cluster on Hetzner Cloud for about $4/month using hetzner-k3s and cert-manager."
---

I want to run a few self-hosted services as cheaply as possible. [Hetzner Cloud](https://www.hetzner.com/cloud/)'s smallest instance with IPv4 costs about $4.10/month. Combined with [hetzner-k3s](https://github.com/vitobotta/hetzner-k3s) for cluster management and k3s's built-in local storage, this is a remarkably cheap way to run production services. This post walks through setting up a single-node k3s cluster, deploying [Keila](https://www.keila.io/) (email newsletter), and securing everything with TLS from [Let's Encrypt](https://letsencrypt.org/).

## Prerequisites

- A [Hetzner Cloud](https://www.hetzner.com/cloud/) account
- A domain managed by [Cloudflare](https://www.cloudflare.com/)
- An SSH key pair (`~/.ssh/id_ed25519`)
- [hetzner-k3s](https://github.com/vitobotta/hetzner-k3s#installation) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) and [helm](https://helm.sh/docs/intro/install/) installed
- An SMTP provider for sending emails (e.g. [Mailgun](https://www.mailgun.com/), [Amazon SES](https://aws.amazon.com/ses/), [Postmark](https://postmarkapp.com/))

## 1. Create a Hetzner API Token

1. Log in to [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Create a new project (e.g. `k3s`)
3. Go to **Security** → **API Tokens** → **Generate API Token**
4. Give it **Read & Write** permissions
5. Save the token

## 2. Create the Cluster

Create a file called `cluster.yaml`:

```yaml
---
hetzner_token: <your-hetzner-api-token>
cluster_name: k3s
kubeconfig_path: "./kubeconfig"
k3s_version: v1.32.0+k3s1

networking:
  ssh:
    port: 22
    use_agent: false
    public_key_path: "~/.ssh/id_ed25519.pub"
    private_key_path: "~/.ssh/id_ed25519"
  allowed_networks:
    ssh:
      - 0.0.0.0/0
      - ::/0
    api:
      - 0.0.0.0/0
      - ::/0
  public_network:
    ipv4: true
    ipv6: true
  private_network:
    enabled: true
    subnet: 10.0.0.0/16
    existing_network_name: ""
  custom_firewall_rules:
    - description: "Allow HTTP"
      direction: in
      protocol: tcp
      port: 80
      source_ips:
        - 0.0.0.0/0
        - ::/0
    - description: "Allow HTTPS"
      direction: in
      protocol: tcp
      port: 443
      source_ips:
        - 0.0.0.0/0
        - ::/0

schedule_workloads_on_masters: true

masters_pool:
  instance_type: cx23
  instance_count: 1
  locations:
    - fsn1

worker_node_pools: []

addons:
  csi_driver:
    enabled: false
  traefik:
    enabled: true
  servicelb:
    enabled: true

protect_against_deletion: true
```

A few things to note:

- **IPv4 included.** You could save $0.60/month by going IPv6-only (`public_network.ipv4: false`), but IPv4 means you can SSH in from any network, all visitors can reach your services regardless of their ISP, and you don't have to troubleshoot IPv6 connectivity issues. It's €6/year well spent.
- **`schedule_workloads_on_masters: true`** is required for a single-node cluster so pods can run on the master node.
- **CSI driver disabled.** We're using k3s's built-in [local-path-provisioner](https://github.com/rancher/local-path-provisioner) instead of Hetzner block storage. Data is stored directly on the node's disk at `/var/lib/rancher/k3s/storage/`. This saves money but means data is lost if the node's disk fails — set up backups.
- **Traefik and ServiceLB enabled.** Traefik handles ingress routing; ServiceLB exposes ports 80 and 443 on the node.
- **Firewall.** Hetzner's Cloud Firewall allows only SSH, HTTP, HTTPS, and the Kubernetes API. Everything else is blocked.

Create the cluster:

```bash
hetzner-k3s create --config cluster.yaml | tee create.log
```

This takes a few minutes. When finished, your kubeconfig is saved to `./kubeconfig`:

```bash
export KUBECONFIG=./kubeconfig
kubectl get nodes
```

You can check the available k3s versions with `hetzner-k3s releases`.

## 3. Set Up DNS on Cloudflare

Get your server's IPv4 address:

```bash
kubectl get nodes -o wide
```

Look for the `EXTERNAL-IP` column.

In the [Cloudflare dashboard](https://dash.cloudflare.com/):

1. Select your domain
2. Go to **DNS** → **Records** → **Add Record**
3. Create a wildcard A record:
   - **Type**: `A`
   - **Name**: `*.k3s`
   - **IPv4 address**: your server's IP address
   - **Proxy status**: **DNS only** (grey cloud)
4. Click **Save**

:::note{title=Why DNS only?}
Cloudflare's free plan doesn't proxy wildcard records. The grey cloud (DNS only) means traffic goes directly to your server. TLS termination is handled by Traefik and cert-manager on the server itself.
:::

Now any subdomain of `k3s.andrewmarder.net` resolves to your server. Adding a new service later is just creating a new Kubernetes Ingress — no DNS changes needed.

## 4. Install cert-manager

[cert-manager](https://cert-manager.io/) automates TLS certificates from Let's Encrypt. We'll use [DNS-01 challenges](https://cert-manager.io/docs/configuration/acme/dns01/) via Cloudflare so we don't need to worry about HTTP-01 challenge routing.

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set crds.enabled=true
```

### Create a Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token** → use the **Edit zone DNS** template
3. Under **Zone Resources**, select your domain
4. Click **Continue to summary** → **Create Token**

Create the Kubernetes secret:

```bash
kubectl create secret generic cloudflare-api-token \
  --namespace cert-manager \
  --from-literal=api-token=<your-cloudflare-api-token>
```

### Create a ClusterIssuer

Save as `cluster-issuer.yaml`:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: you@example.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - dns01:
          cloudflare:
            apiTokenSecretRef:
              name: cloudflare-api-token
              key: api-token
        selector:
          dnsZones:
            - "andrewmarder.net"
```

Apply it:

```bash
kubectl apply -f cluster-issuer.yaml
```

## 5. Deploy Keila

### Create a Namespace and Secrets

```bash
kubectl create namespace keila

# Generate the Postgres password first so we can embed it in the DB URL
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')

kubectl create secret generic keila-secrets \
  --namespace keila \
  --from-literal=postgres-password="$POSTGRES_PASSWORD" \
  --from-literal=db-url="postgres://keila:${POSTGRES_PASSWORD}@postgres/keila" \
  --from-literal=secret-key-base="$(openssl rand -base64 48)" \
  --from-literal=keila-user="you@example.com" \
  --from-literal=keila-password="$(openssl rand -base64 24)"
```

To see your Keila login password later:

```bash
kubectl get secret keila-secrets -n keila -o jsonpath='{.data.keila-password}' | base64 -d
```

### Apply the Manifests

Save as `keila.yaml`:

```yaml
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
  namespace: keila
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: local-path
  resources:
    requests:
      storage: 5Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: keila-uploads
  namespace: keila
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: local-path
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: keila
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          env:
            - name: POSTGRES_USER
              value: keila
            - name: POSTGRES_DB
              value: keila
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: keila-secrets
                  key: postgres-password
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
          readinessProbe:
            exec:
              command: ["pg_isready", "-U", "keila"]
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              memory: 128Mi
              cpu: 100m
            limits:
              memory: 512Mi
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: postgres-data
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: keila
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: keila
  namespace: keila
spec:
  replicas: 1
  selector:
    matchLabels:
      app: keila
  template:
    metadata:
      labels:
        app: keila
    spec:
      containers:
        - name: keila
          image: pentacent/keila:latest
          env:
            - name: DB_URL
              valueFrom:
                secretKeyRef:
                  name: keila-secrets
                  key: db-url
            - name: SECRET_KEY_BASE
              valueFrom:
                secretKeyRef:
                  name: keila-secrets
                  key: secret-key-base
            - name: URL_HOST
              value: keila.k3s.andrewmarder.net
            - name: URL_SCHEMA
              value: https
            - name: PORT
              value: "4000"
            - name: DISABLE_REGISTRATION
              value: "true"
            - name: KEILA_USER
              valueFrom:
                secretKeyRef:
                  name: keila-secrets
                  key: keila-user
            - name: KEILA_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: keila-secrets
                  key: keila-password
          ports:
            - containerPort: 4000
          volumeMounts:
            - name: uploads
              mountPath: /opt/app/uploads
          resources:
            requests:
              memory: 128Mi
              cpu: 100m
            limits:
              memory: 512Mi
      volumes:
        - name: uploads
          persistentVolumeClaim:
            claimName: keila-uploads
---
apiVersion: v1
kind: Service
metadata:
  name: keila
  namespace: keila
spec:
  selector:
    app: keila
  ports:
    - port: 4000
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: keila
  namespace: keila
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - keila.k3s.andrewmarder.net
      secretName: keila-tls
  rules:
    - host: keila.k3s.andrewmarder.net
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: keila
                port:
                  number: 4000
```

Apply it:

```bash
kubectl apply -f keila.yaml
```

### Verify

Wait a minute or two for everything to start, then check:

```bash
# All pods should be Running
kubectl get pods -n keila

# Certificate should be Ready (may take a minute for DNS-01 validation)
kubectl get certificate -n keila

# Check the ingress
kubectl get ingress -n keila
```

Open `https://keila.k3s.andrewmarder.net` in your browser and log in with the credentials from your secret. Configure an SMTP sender under **Senders** → **Create** to start sending emails.

## 6. Back Up to Backblaze B2

Local storage means data lives on a single disk. [Restic](https://restic.net/) with [Backblaze B2](https://www.backblaze.com/cloud-storage) gives us encrypted, deduplicated, off-site backups for next to nothing ($0.006/GB-month — orders of magnitude cheaper than Hetzner block storage).

### Create a B2 Bucket

1. Sign up at [backblaze.com](https://www.backblaze.com/) and enable **B2 Cloud Storage**
2. Create a **private** bucket (e.g. `your-k3s-backups`)
3. Go to **Application Keys** → **Add a New Application Key**
4. Restrict it to your bucket with **Read and Write** access
5. Save the **keyID** and **applicationKey**

### Create the Backup Secret

```bash
# IMPORTANT: Save this restic password somewhere safe (e.g. password manager).
# Without it, your backups are unrecoverable.
RESTIC_PASSWORD=$(openssl rand -base64 32)
echo "Restic password: $RESTIC_PASSWORD"

kubectl create secret generic backup-secrets \
  --namespace keila \
  --from-literal=restic-repository="b2:your-k3s-backups:keila" \
  --from-literal=restic-password="$RESTIC_PASSWORD" \
  --from-literal=b2-account-id="your-b2-key-id" \
  --from-literal=b2-account-key="your-b2-application-key"
```

### Create the Backup CronJob

Save as `backup.yaml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup
  namespace: keila
spec:
  schedule: "0 2 * * *"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          initContainers:
            - name: pg-dump
              image: postgres:16-alpine
              command: ["sh", "-c"]
              args:
                - pg_dump -h postgres -U keila keila | gzip > /backup/keila.sql.gz
              env:
                - name: PGPASSWORD
                  valueFrom:
                    secretKeyRef:
                      name: keila-secrets
                      key: postgres-password
              volumeMounts:
                - name: backup-data
                  mountPath: /backup
          containers:
            - name: restic
              image: restic/restic:latest
              command: ["sh", "-c"]
              args:
                - |
                  restic snapshots || restic init
                  restic backup /backup/keila.sql.gz --tag keila --tag postgres
                  restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune
              env:
                - name: RESTIC_REPOSITORY
                  valueFrom:
                    secretKeyRef:
                      name: backup-secrets
                      key: restic-repository
                - name: RESTIC_PASSWORD
                  valueFrom:
                    secretKeyRef:
                      name: backup-secrets
                      key: restic-password
                - name: B2_ACCOUNT_ID
                  valueFrom:
                    secretKeyRef:
                      name: backup-secrets
                      key: b2-account-id
                - name: B2_ACCOUNT_KEY
                  valueFrom:
                    secretKeyRef:
                      name: backup-secrets
                      key: b2-account-key
              volumeMounts:
                - name: backup-data
                  mountPath: /backup
          volumes:
            - name: backup-data
              emptyDir: {}
          restartPolicy: OnFailure
```

Apply it:

```bash
kubectl apply -f backup.yaml
```

The CronJob runs nightly at 2 AM. The init container dumps PostgreSQL, then the main container encrypts and uploads the dump to B2 via restic. The `forget` command prunes old snapshots — keeping 7 daily, 4 weekly, and 6 monthly backups.

### Test the Backup

Trigger a manual run and verify:

```bash
# Run the backup now
kubectl create job --from=cronjob/backup -n keila backup-test

# Watch it complete
kubectl logs -n keila job/backup-test -c pg-dump --follow
kubectl logs -n keila job/backup-test -c restic --follow

# Clean up the test job
kubectl delete job -n keila backup-test
```

### Restore

```bash
# List available snapshots (run from a machine with restic installed)
export RESTIC_REPOSITORY="b2:your-k3s-backups:keila"
export RESTIC_PASSWORD="your-restic-password"
export B2_ACCOUNT_ID="your-b2-key-id"
export B2_ACCOUNT_KEY="your-b2-application-key"
restic snapshots

# Restore the latest snapshot
restic restore latest --target /tmp/restore

# Load it into PostgreSQL
gunzip -c /tmp/restore/backup/keila.sql.gz \
  | kubectl exec -i -n keila deploy/postgres -- psql -U keila keila
```

## 7. Security

The setup above covers the basics. Here's what's in place and what you should consider hardening.

**Already configured:**

- **Firewall.** The Hetzner Cloud Firewall only allows SSH (22), HTTP (80), HTTPS (443), and the Kubernetes API (6443). All other ports are blocked.
- **SSH keys only.** Hetzner Cloud disables password authentication when servers are created with SSH keys.
- **TLS everywhere.** cert-manager provisions Let's Encrypt certificates automatically. All HTTP traffic is encrypted.
- **No exposed databases.** PostgreSQL is only reachable within the cluster via its ClusterIP service.
- **Registration disabled.** `DISABLE_REGISTRATION=true` prevents strangers from creating Keila accounts.

**Recommended hardening:**

- **Restrict SSH and API access.** The config above allows SSH and API access from any IP (`0.0.0.0/0` and `::/0`). If you have a stable IP address, replace these with your specific address in `allowed_networks`.
- **Enable automatic OS updates.** SSH into the node and enable unattended upgrades:

  ```bash
  ssh root@<server-ip>
  apt install -y unattended-upgrades
  dpkg-reconfigure -plow unattended-upgrades
  ```

- **Back up your data.** If you haven't already, set up the [Backblaze B2 backups](#6-back-up-to-backblaze-b2) described above.

## 8. Maintenance

### Upgrading k3s

hetzner-k3s installs the [System Upgrade Controller](https://github.com/rancher/system-upgrade-controller) by default. To upgrade k3s, update `k3s_version` in your `cluster.yaml` and run:

```bash
hetzner-k3s upgrade --config cluster.yaml
```

### Updating Container Images

Pull the latest Keila and PostgreSQL images periodically:

```bash
kubectl rollout restart deployment/keila -n keila
kubectl rollout restart deployment/postgres -n keila
```

## 9. Cost

| Item | Monthly Cost |
|------|-------------|
| CX23 (2 vCPU, 4 GB RAM, 40 GB disk) | $3.50 |
| Primary IPv4 address | $0.60 |
| Local storage (instead of block storage) | €0 |
| Backblaze B2 backups (first 10 GB free) | ~$0 |
| Let's Encrypt certificates | Free |
| **Total** | **$4.10/month** |

Prices are for the `fsn1` (Falkenstein, Germany) location, excluding VAT. Check [Hetzner's pricing page](https://www.hetzner.com/cloud/) for current rates. You can list available instance types with:

```bash
curl -H "Authorization: Bearer $HCLOUD_TOKEN" 'https://api.hetzner.cloud/v1/server_types'
```

## 10. Adding New Services

The wildcard DNS record means adding a new service requires no DNS changes. For any new app:

1. Create a namespace, deployment, and service
2. Add an Ingress with the `cert-manager.io/cluster-issuer: letsencrypt-prod` annotation
3. Set the host to `<service>.k3s.andrewmarder.net`

cert-manager handles TLS automatically. Traefik routes traffic based on the hostname.

## References

- [hetzner-k3s Documentation](https://vitobotta.github.io/hetzner-k3s/)
- [hetzner-k3s Source Code](https://github.com/vitobotta/hetzner-k3s)
- [cert-manager Cloudflare DNS-01 Docs](https://cert-manager.io/docs/configuration/acme/dns01/cloudflare/)
- [k3s Local Path Provisioner](https://github.com/rancher/local-path-provisioner)
- [Keila Configuration Docs](https://www.keila.io/docs/configuration)
- [Restic Documentation](https://restic.readthedocs.io/)
- [Backblaze B2 + Restic Guide](https://www.backblaze.com/docs/cloud-storage-integrate-restic-with-backblaze-b2)
- [Hetzner Cloud Pricing](https://www.hetzner.com/cloud/)
