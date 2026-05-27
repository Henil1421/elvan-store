# Backend API – Elvan Store

Express.js backend that sits between Supabase and the frontend, providing intelligent caching to eliminate data-loading delays.

## Setup

```bash
cd Backend
npm install
cp .env.example .env
# Fill in your Supabase credentials in .env
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Server port |
| `SUPABASE_PROJECT_ID` | – | Your Supabase project ID |
| `SUPABASE_URL` | – | Your Supabase project URL |
| `SUPABASE_PUBLISH_KEY` | – | Your Supabase publish key |
| `NODE_ENV` | `development` | Environment |
| `CACHE_TTL` | `300` | Cache time-to-live in seconds |
| `ENABLE_REALTIME` | `true` | Enable Supabase real-time subscriptions |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/products` | All products (cached) |
| `GET` | `/api/products/:id` | Single product by ID or handle |
| `GET` | `/api/products/cache/status` | Cache stats |
| `POST` | `/api/products/cache/refresh` | Force cache refresh |

## Caching Strategy

1. **In-memory cache** (node-cache) with 5-minute TTL – fastest path.
2. **File-based cache** in `data/cache/` – survives server restarts.
3. **Supabase Real-time subscriptions** – auto-invalidates cache when data changes.
4. **Warm-up on startup** – pre-loads product data so the first frontend request is instant.

## Deployment

For production, set `NODE_ENV=production` and point `FRONTEND_ORIGIN` to your deployed frontend URL. Run with `npm start` or a process manager like PM2.
