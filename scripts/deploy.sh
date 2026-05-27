#!/usr/bin/env bash
# =============================================================================
#  deploy.sh — Elvan Store deployment script for Hostinger VPS
#
#  Domains : frontend → ui.elvan.site    (static Vite build served by Nginx)
#            backend  → api.elvan.site  (Express.js managed by PM2)
#  Server  : Hostinger VPS  76.13.246.75
#
#  Usage (run as a non-root user with sudo privileges):
#    chmod +x scripts/deploy.sh
#    ./scripts/deploy.sh
# =============================================================================
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIST="$REPO_DIR/Frontend/dist"
FRONTEND_SERVE="/var/www/elvan-frontend"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

info()  { echo -e "\033[1;34m[INFO]\033[0m  $*"; }
ok()    { echo -e "\033[1;32m[ OK ]\033[0m  $*"; }
warn()  { echo -e "\033[1;33m[WARN]\033[0m  $*"; }
die()   { echo -e "\033[1;31m[ERR ]\033[0m  $*" >&2; exit 1; }

# ── 1. Prerequisite checks ───────────────────────────────────────────────────
info "Checking prerequisites..."
command -v node  >/dev/null 2>&1 || die "Node.js not found. Install Node ≥18."
command -v npm   >/dev/null 2>&1 || die "npm not found."
command -v pm2   >/dev/null 2>&1 || die "PM2 not found. Run: npm install -g pm2"
command -v nginx >/dev/null 2>&1 || die "Nginx not found."
node --version | grep -qE '^v(1[89]|[2-9][0-9])' || \
    die "Node.js ≥18 required. Found: $(node --version)"
ok "All prerequisites satisfied."

# ── 2. Pull latest code ───────────────────────────────────────────────────────
info "Pulling latest code from git..."
cd "$REPO_DIR"
if ! git pull --ff-only; then
    die "git pull failed. The local branch may have diverged from remote.\n       Run 'git status' to inspect, then resolve conflicts and re-run this script."
fi
ok "Code up to date."

# ── 3. Install & build frontend ───────────────────────────────────────────────
info "Installing frontend dependencies..."
cd "$REPO_DIR/Frontend"
npm ci --prefer-offline

info "Building frontend for production..."
npm run build
ok "Frontend built → $FRONTEND_DIST"

# ── 4. Deploy frontend static files ──────────────────────────────────────────
info "Deploying frontend static files to $FRONTEND_SERVE/dist ..."
sudo mkdir -p "$FRONTEND_SERVE"
sudo rsync -a --delete "$FRONTEND_DIST/" "$FRONTEND_SERVE/dist/"
ok "Frontend static files deployed."

# ── 5. Install backend dependencies ──────────────────────────────────────────
info "Installing backend dependencies..."
cd "$REPO_DIR/Backend"
npm ci --omit=dev --prefer-offline
ok "Backend dependencies installed."

# ── 6. Validate backend .env ─────────────────────────────────────────────────
if [[ ! -f "$REPO_DIR/Backend/.env" ]]; then
    warn "Backend/.env not found. Copying from .env.example — fill in your secrets!"
    cp "$REPO_DIR/Backend/.env.example" "$REPO_DIR/Backend/.env"
fi

# ── 7. Nginx virtual-host configs ────────────────────────────────────────────
info "Installing Nginx configs..."

# Shared snippet (rate-limit zone used by the API virtual-host)
sudo cp "$REPO_DIR/nginx/elvan-shared.conf" /etc/nginx/conf.d/elvan-shared.conf

for CONF in ui.elvan.site.conf api.elvan.site.conf; do
    sudo cp "$REPO_DIR/nginx/$CONF" "$NGINX_AVAILABLE/$CONF"
    LINK="$NGINX_ENABLED/$CONF"
    [[ -L "$LINK" ]] || sudo ln -s "$NGINX_AVAILABLE/$CONF" "$LINK"
done

sudo nginx -t || die "Nginx config test failed."
sudo systemctl reload nginx
ok "Nginx reloaded."

# ── 8. Start / reload PM2 processes ──────────────────────────────────────────
cd "$REPO_DIR"
info "Starting / reloading PM2 processes..."
if pm2 list | grep -q "elvan-backend"; then
    pm2 reload ecosystem.config.cjs --env production
else
    pm2 start ecosystem.config.cjs --env production
fi

pm2 save
ok "PM2 processes running."

# ── 9. (Optional) Enable PM2 startup on boot ─────────────────────────────────
if ! systemctl is-enabled pm2-"$USER" >/dev/null 2>&1; then
    info "Registering PM2 startup service..."
    STARTUP_CMD=$(pm2 startup 2>&1 | grep "sudo env")
    if [[ -n "$STARTUP_CMD" ]]; then
        warn "Run the following command to enable PM2 on boot (requires sudo):"
        echo "  $STARTUP_CMD"
        warn "Then run: pm2 save"
    else
        warn "Could not detect the PM2 startup command. Run 'pm2 startup' manually."
    fi
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
ok "Deployment complete."
echo "  Frontend : https://ui.elvan.site"
echo "  Backend  : https://api.elvan.site/health"
