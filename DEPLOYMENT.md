# Elvan Store — Deployment Guide

> **Server:** Hostinger VPS &nbsp;|&nbsp; **IP:** `76.13.246.75`  
> **Frontend:** `https://ui.elvan.site` &nbsp;|&nbsp; **Backend API:** `https://api.elvan.site`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [DNS Configuration](#3-dns-configuration)
4. [Server Requirements](#4-server-requirements)
5. [Architecture](#5-architecture)
6. [Step-by-Step Deployment](#6-step-by-step-deployment)
7. [SSL/HTTPS Configuration](#7-sslhttps-configuration)
8. [Environment Variables](#8-environment-variables)
9. [PM2 Process Management](#9-pm2-process-management)
10. [Nginx Configuration](#10-nginx-configuration)
11. [Monitoring and Logs](#11-monitoring-and-logs)
12. [Troubleshooting](#12-troubleshooting)
13. [Maintenance](#13-maintenance)

---

## 1. Overview

Elvan Store is a full-stack e-commerce application with two independently deployed units:

| Unit | Technology | Domain | Port |
|------|-----------|--------|------|
| **Frontend** | React 18 + Vite (static build) | `ui.elvan.site` | served by Nginx |
| **Backend API** | Express.js + node-cache | `api.elvan.site` | `4000` (proxied by Nginx) |

Nginx acts as a reverse-proxy and TLS terminator in front of both services.  
PM2 manages the Node.js backend process, ensuring automatic restarts and log rotation.

---

## 2. Prerequisites

### Local machine

- Git
- Node.js ≥ 18 (for running builds locally if needed)

### Hostinger VPS (remote)

The setup script below will guide you, but you must have these installed before running it:

| Software | Minimum version | Install |
|----------|----------------|---------|
| Ubuntu / Debian | 22.04 LTS | (OS already installed) |
| Node.js | 18 LTS | See §4 |
| npm | 9+ | bundled with Node |
| PM2 | latest | `npm install -g pm2` |
| Nginx | 1.18+ | `sudo apt install nginx` |
| Certbot | latest | `sudo apt install certbot python3-certbot-nginx` |
| Git | 2.x | `sudo apt install git` |

---

## 3. DNS Configuration

Log in to your **domain registrar** (or Hostinger's DNS panel) and create the following records.

> Replace `76.13.246.75` with the actual VPS IP if it ever changes.

### Required DNS Records

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | `ui` | `76.13.246.75` | **300** |
| **A** | `api` | `76.13.246.75` | **300** |

> **TTL note:** `300` seconds (5 minutes) is recommended during initial setup so DNS changes
> propagate quickly. Once the deployment is stable you can raise this to `3600` (1 hour) or
> `86400` (24 hours) to reduce DNS lookup load.

### Verification

After saving the records, verify propagation (may take up to 5 minutes):

```bash
# From your local machine
dig +short A ui.elvan.site      # should return 76.13.246.75
dig +short A api.elvan.site   # should return 76.13.246.75
```

---

## 4. Server Requirements

### Minimum Recommended VPS Specs

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| vCPU | 1 | 2 |
| RAM | 1 GB | 2 GB |
| Disk | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Bandwidth | 100 Mbps | 200 Mbps |

### Installing Node.js 20 LTS (via NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version   # v20.x.x
npm --version    # 10.x.x
```

### Installing PM2 globally

```bash
sudo npm install -g pm2
pm2 --version
```

### Installing Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

### Installing Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # ports 80 & 443
sudo ufw enable
sudo ufw status
```

---

## 5. Architecture

```
Internet
   │
   │  DNS: ui.elvan.site       → 76.13.246.75
   │  DNS: api.elvan.site    → 76.13.246.75
   │
   ▼
┌──────────────────────────────────────────┐
│           Nginx (TLS termination)        │
│                                          │
│  ui.elvan.site    → serve /var/www/      │
│                     elvan-frontend/dist  │
│                                          │
│  api.elvan.site   → proxy_pass           │
│                     127.0.0.1:4000       │
└─────────────────────┬────────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │  PM2             │
            │  elvan-backend  │
            │  (port 4000)    │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Supabase        │
            │  (cloud DB +     │
            │   Auth)          │
            └─────────────────┘
```

**Request flow — frontend asset:**
`Browser → Nginx (HTTPS 443) → serves static file from /var/www/elvan-frontend/dist`

**Request flow — API call:**
`Browser → Nginx (HTTPS 443, api.elvan.site) → proxy_pass HTTP → Express.js :4000 → node-cache / Supabase`

---

## 6. Step-by-Step Deployment

### 6.1 First-time server setup

SSH into the VPS:

```bash
ssh root@76.13.246.75
```

Create a non-root deploy user (recommended):

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

Install all prerequisites from §4.

### 6.2 Clone the repository

```bash
cd /home/deploy
git clone https://github.com/krishnao3o2/Elvan.krishna.2026.git elvan
cd elvan
```

### 6.3 Configure the backend environment

```bash
cd Backend
cp .env.example .env
nano .env       # fill in SUPABASE_URL, SUPABASE_PUBLISH_KEY
cd ..
```

Minimum required values in `Backend/.env`:

```dotenv
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_PUBLISH_KEY=<anon-key>
CACHE_TTL=300
ENABLE_REALTIME=true
FRONTEND_ORIGIN=https://ui.elvan.site
```

### 6.4 Configure the frontend environment

```bash
cd Frontend
cp .env.example .env
nano .env       # set VITE_API_URL if you override the default
cd ..
```

Minimum required values in `Frontend/.env`:

```dotenv
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISH_KEY=<anon-key>
```

### 6.5 Run the automated deploy script

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

The script will:

1. Pull the latest code.
2. Install frontend dependencies and build `dist/`.
3. Copy the built assets to `/var/www/elvan-frontend/dist/`.
4. Install backend production dependencies.
5. Install Nginx virtual-host configs and reload Nginx.
6. Start / reload PM2 with `ecosystem.config.cjs`.
7. Save the PM2 process list and register the startup hook.

### 6.6 Manual steps (first deploy only)

#### Obtain SSL certificates (§7)

Run Certbot after the deploy script completes and Nginx is serving traffic on port 80.

---

## 7. SSL/HTTPS Configuration

Certificates are managed by **Let's Encrypt** via Certbot.

### Issue certificates

```bash
# Frontend domain
sudo certbot --nginx -d ui.elvan.site

# Backend API domain
sudo certbot --nginx -d api.elvan.site
```

Certbot will:
- Verify domain ownership via HTTP-01 challenge.
- Obtain certificates from Let's Encrypt.
- Automatically edit the Nginx config files to add the `ssl_certificate` directives.
- Configure an HTTP → HTTPS redirect.

### Auto-renewal

Certbot installs a systemd timer that renews certificates automatically.  
Verify it is active:

```bash
sudo systemctl status certbot.timer
# or test a dry-run renewal:
sudo certbot renew --dry-run
```

Certificates renew automatically every 60 days (Let's Encrypt expiry: 90 days).

---

## 8. Environment Variables

### Backend (`Backend/.env`)

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `4000` | No | HTTP port the Express server listens on |
| `NODE_ENV` | `development` | **Yes** | Set to `production` on the VPS |
| `SUPABASE_URL` | — | **Yes** | Supabase project REST URL |
| `SUPABASE_PUBLISH_KEY` | — | **Yes** | Supabase anon/publishable key |
| `CACHE_TTL` | `300` | No | In-memory cache TTL in seconds |
| `ENABLE_REALTIME` | `true` | No | Enable Supabase real-time cache invalidation |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | **Yes** | Allowed CORS origin (`https://ui.elvan.site`) |

### Frontend (`Frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | **Yes** | Supabase project URL |
| `VITE_SUPABASE_PUBLISH_KEY` | **Yes** | Supabase anon/publishable key |

> **Security:** Never commit `.env` files. They are listed in `.gitignore`.

---

## 9. PM2 Process Management

The file `ecosystem.config.cjs` at the project root defines the managed processes.

### Common PM2 commands

```bash
# Start all processes (first deploy)
pm2 start ecosystem.config.cjs --env production

# Zero-downtime reload (redeploys without dropping connections)
pm2 reload ecosystem.config.cjs --env production

# Show status of all processes
pm2 list

# Show real-time logs for the backend
pm2 logs elvan-backend

# Show last 200 log lines
pm2 logs elvan-backend --lines 200

# Restart a specific process
pm2 restart elvan-backend

# Stop all processes
pm2 stop ecosystem.config.cjs

# Delete processes from PM2 registry
pm2 delete ecosystem.config.cjs

# Persist current process list across reboots
pm2 save

# Generate and install the OS startup script
pm2 startup
# → copy-paste the command it prints, then run: pm2 save
```

### Process configuration highlights (`ecosystem.config.cjs`)

| Setting | Value | Purpose |
|---------|-------|---------|
| `instances` | `1` | Single Node.js process (scale to `'max'` for cluster mode) |
| `exec_mode` | `fork` | Fork mode — suitable for single-instance ESM app |
| `autorestart` | `true` | Restart on crash |
| `max_restarts` | `10` | Stop after 10 consecutive crashes |
| `restart_delay` | `3000 ms` | Wait 3 s between restarts |
| `error_file` | `logs/backend-error.log` | Stderr log path |
| `out_file` | `logs/backend-out.log` | Stdout log path |

---

## 10. Nginx Configuration

The `nginx/` directory contains three configuration files:

| File | Domain | Purpose |
|------|--------|---------|
| `nginx/elvan-shared.conf` | — | Shared Nginx directives (rate-limit zone) |
| `nginx/ui.elvan.site.conf` | `ui.elvan.site` | Serves the static Vite build |
| `nginx/api.elvan.site.conf` | `api.elvan.site` | Reverse-proxies to Express on port 4000 |

### Installing configs

```bash
# Copy shared snippet (must be in conf.d/ so it is included globally)
sudo cp nginx/elvan-shared.conf /etc/nginx/conf.d/elvan-shared.conf

# Copy virtual-host configs
sudo cp nginx/ui.elvan.site.conf    /etc/nginx/sites-available/ui.elvan.site.conf
sudo cp nginx/api.elvan.site.conf /etc/nginx/sites-available/api.elvan.site.conf

# Enable (symlink into sites-enabled)
sudo ln -s /etc/nginx/sites-available/ui.elvan.site.conf \
           /etc/nginx/sites-enabled/ui.elvan.site.conf

sudo ln -s /etc/nginx/sites-available/api.elvan.site.conf \
           /etc/nginx/sites-enabled/api.elvan.site.conf

# Remove default site if still present
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

### Key Nginx settings

#### Frontend (`ui.elvan.site.conf`)

- Serves `/var/www/elvan-frontend/dist` as the document root.
- `try_files $uri $uri/ /index.html` enables React Router client-side routing.
- Hashed Vite assets (`.js`, `.css`) are cached for 1 year (`Cache-Control: public, immutable`).
- Gzip compression enabled for text assets.
- HTTP redirects to HTTPS.

#### Backend (`api.elvan.site.conf`)

- Reverse-proxies all traffic to `http://127.0.0.1:4000`.
- Forwards `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto` headers.
- Rate-limited to **60 requests/minute per IP** (`limit_req zone=api burst=20`).
- Keep-alive connections reused to the upstream.
- HTTP redirects to HTTPS.

---

## 11. Monitoring and Logs

### PM2 logs

```bash
pm2 logs                         # all processes, live tail
pm2 logs elvan-backend           # backend only, live tail
pm2 logs elvan-backend --lines 500   # last 500 lines
pm2 flush                        # clear all log files
```

Log files are also written to:

```
logs/backend-out.log     # stdout
logs/backend-error.log   # stderr
```

### Nginx logs

```bash
sudo tail -f /var/log/nginx/ui.elvan.site-access.log
sudo tail -f /var/log/nginx/ui.elvan.site-error.log
sudo tail -f /var/log/nginx/api.elvan.site-access.log
sudo tail -f /var/log/nginx/api.elvan.site-error.log
```

### PM2 monitoring dashboard

```bash
pm2 monit   # real-time CPU / memory / log dashboard
```

### Health check endpoint

```bash
curl https://api.elvan.site/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Cache status endpoint

```bash
curl https://api.elvan.site/api/products/cache/status
```

---

## 12. Troubleshooting

### Backend API not responding

1. Check PM2 status: `pm2 list`
2. View recent errors: `pm2 logs elvan-backend --lines 50`
3. Verify the port is listening: `ss -tlnp | grep 4000`
4. Check Nginx proxy config: `sudo nginx -t`

### Frontend shows blank page / 404

1. Ensure the build exists: `ls /var/www/elvan-frontend/dist/index.html`
2. Check Nginx error log: `sudo tail -20 /var/log/nginx/ui.elvan.site-error.log`
3. Verify the `root` directive in `ui.elvan.site.conf` points to the correct path.
4. Re-run: `cd Frontend && npm run build` then copy to `/var/www/elvan-frontend/dist/`.

### SSL certificate errors

```bash
# Renew manually
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates
```

### DNS not resolving

```bash
dig +short A ui.elvan.site
nslookup api.elvan.site
```

- TTL of `300` means changes propagate within 5 minutes.
- If using Hostinger's DNS, allow up to 15 minutes after saving records.

### CORS errors in the browser

- Confirm `FRONTEND_ORIGIN=https://ui.elvan.site` is set in `Backend/.env`.
- Restart the backend: `pm2 restart elvan-backend`.
- Check CORS headers: `curl -I -H "Origin: https://ui.elvan.site" https://api.elvan.site/api/products`.

### Port 4000 already in use

```bash
# Find the process
sudo lsof -i :4000
# Kill it (replace <PID>)
kill -9 <PID>
# Then restart PM2
pm2 restart elvan-backend
```

---

## 13. Maintenance

### Update the application

```bash
cd /home/deploy/elvan
./scripts/deploy.sh
```

The deploy script performs a full pull → build → deploy → PM2 reload cycle automatically.

### Force backend cache refresh

```bash
curl -X POST https://api.elvan.site/api/products/cache/refresh
```

### Rotate logs

PM2 log rotation (install once):

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Update Node.js

```bash
# Using NodeSource (example: upgrade to Node 22)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
pm2 restart all
```

### SSL certificate renewal (manual)

Certbot auto-renews via its systemd timer.  
If you ever need to renew manually:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Backup checklist

| Item | Location | Frequency |
|------|----------|-----------|
| Database | Supabase dashboard (automatic backups) | Daily |
| `.env` files | Secure password manager / encrypted storage | On change |
| Nginx configs | `nginx/` in this repo | On change |
| PM2 config | `ecosystem.config.cjs` in this repo | On change |
