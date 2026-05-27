/**
 * PM2 ecosystem config — Elvan Store
 *
 * Domains  : frontend → ui.elvan.site
 *            backend  → api.elvan.site
 * Server   : Hostinger VPS  76.13.246.75
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs          # start all processes
 *   pm2 reload ecosystem.config.cjs         # zero-downtime reload
 *   pm2 stop   ecosystem.config.cjs         # stop all
 *   pm2 save                                # persist across reboots
 */

module.exports = {
  apps: [
    /* ─── Backend API ───────────────────────────────────────────────────────── */
    {
      name: 'elvan-backend',
      cwd: './Backend',
      script: 'src/server.js',
      interpreter: 'node',
      // Node ≥18 ESM support – no additional flags needed
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,

      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        CACHE_TTL: 300,
        ENABLE_REALTIME: 'true',
        FRONTEND_ORIGIN: 'https://ui.elvan.site',
        // Set SUPABASE_URL and SUPABASE_PUBLISH_KEY in /Backend/.env
      },

      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      merge_logs: true,
    },
  ],
};
