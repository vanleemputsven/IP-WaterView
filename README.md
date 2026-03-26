# AquaSense

IoT pool monitoring: temperature, pH, and chlorine via connected devices (e.g. ESP32).

## Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Recharts
- **Backend**: Next.js Route Handlers, Prisma, Supabase Auth
- **Database**: PostgreSQL (Supabase)
- **Hosting**: Vercel + Supabase

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `DATABASE_URL` — Prisma connection string (Supabase pooler, port 6543, `?pgbouncer=true`)
- `DIRECT_URL` — Direct connection for migrations (port 5432)

### 3. Database

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run

```bash
npm run dev
```

## Supabase configuration

1. Create a project at [supabase.com](https://supabase.com)
2. In Authentication > URL Configuration, set:
   - Site URL: `http://localhost:3000` (dev) or your production URL
   - Redirect URLs: `http://localhost:3000/auth/callback`
3. Enable Email auth in Authentication > Providers

## Testing the measurement API

1. Sign up at `/signup`
2. Go to Admin > Devices (first user is admin)
3. Create a device — copy the API key
4. POST measurements:

```bash
curl -X POST http://localhost:3000/api/measurements \
  -H "X-Device-Token: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"temperatureCelsius": 25.5, "ph": 7.2, "chlorinePpm": 1.5}'
```

## Project structure

```
src/
├── app/              # Routes
│   ├── (auth)/       # Login, signup, callback
│   ├── (dashboard)/  # User dashboard
│   ├── (admin)/      # Admin area
│   └── api/          # REST API
├── components/       # UI components
├── lib/              # Auth, DB, validation, services
├── config/           # Env, constants
└── types/            # Shared types
```

## Docs

See [docs/architecture.md](docs/architecture.md) for architecture details.
