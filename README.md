# Elvan Store

Full-stack e-commerce project with a React/Vite frontend and an Express.js backend that caches Supabase data to eliminate loading delays.

## Project Structure

```
.
├── Frontend/   # React + Vite storefront (port 3000)
└── Backend/    # Express.js API with caching (port 4000)
```

## Getting Started

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env   # Copy the example environment file
# Edit .env and add your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISH_KEY
npm run dev            # http://localhost:3000
```

**Required Environment Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISH_KEY` - Your Supabase publish key

Get these from your [Supabase project settings](https://app.supabase.com/project/_/settings/api).

### Backend

```bash
cd Backend
npm install
cp .env.example .env   # add SUPABASE_URL and SUPABASE_PUBLISH_KEY
npm run dev            # http://localhost:4000
```

## Development Workflow

1. Start the backend first (`cd Backend && npm run dev`).
2. Start the frontend (`cd Frontend && npm run dev`).
3. The frontend fetches products via the backend API (`http://localhost:4000/api/products`), which serves cached data for instant loads.
4. When backend is unavailable, the frontend falls back to direct Supabase calls automatically.

## Architecture

- **Frontend** (port 3000): React 18 + Vite + Tailwind + Supabase Auth
- **Backend** (port 4000): Express.js with node-cache (5-minute TTL) + file-based cache fallback + Supabase Real-time subscriptions for automatic cache invalidation

See [Backend/README.md](Backend/README.md) for full backend documentation.
