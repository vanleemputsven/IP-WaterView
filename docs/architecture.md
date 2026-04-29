# AquaSense Architecture

## 1. ArchForm Reference Analysis

### What to Reuse (Conceptually)

| Pattern | ArchForm | AquaSense adaptation |
|---------|----------|----------------------|
| **Folder structure** | `app/`, `components/`, `lib/` | Use `src/` prefix for cleaner separation; keep feature-based component folders |
| **Naming** | kebab-case files, PascalCase components | Same |
| **Component organization** | Feature folders (assets/, references/) | `dashboard/`, `admin/`, `measurements/` |
| **Layout** | Single root layout, header, nav, footer | Same; add route groups for (dashboard), (admin) |
| **API structure** | `app/api/*/route.ts` | Same; add service/repository layer |
| **Barrel exports** | Selective (break-reminder) | Use sparingly for feature boundaries |

### What NOT to Reuse

| ArchForm Pattern | Reason |
|------------------|--------|
| MongoDB + native driver | AquaSense uses PostgreSQL + Prisma for relational data, migrations, type safety |
| NextAuth Credentials | AquaSense uses Supabase Auth (required stack) |
| Manual validation | User rules require Zod; all inputs must be validated |
| Single admin (email + hash) | AquaSense needs roles (user, admin) and multi-user support |
| Inline API logic | AquaSense separates routes → services → repositories |
| Dutch/mixed language | English only |

### What to Improve

| Area | ArchForm Issue | AquaSense approach |
|------|----------------|-------------------|
| **Validation** | Manual `typeof`, no schema | Zod schemas for all API inputs and form data |
| **Auth logging** | Logs credentials in dev | No credential logging; structured audit logs only |
| **Error handling** | Generic 500s, potential stack leak | Typed error responses; never leak internals |
| **External fetches** | No allowlist | N/A for MVP (no scraping); prepare for future |
| **Rate limiting** | None | Add for IoT and public endpoints |
| **Role model** | Binary (admin vs not) | Explicit `Role` enum; RBAC from day one |

---

## 2. Proposed Project Structure

```
AquaSense/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route group: login, signup, callback
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── auth/callback/
│   │   ├── (dashboard)/              # Route group: user dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Pool status overview
│   │   │   └── history/
│   │   ├── (admin)/                   # Route group: admin area
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── logs/
│   │   │   │   ├── settings/
│   │   │   │   └── devices/
│   │   │   └── ...
│   │   ├── api/
│   │   │   ├── measurements/          # IoT device ingestion
│   │   │   │   └── route.ts
│   │   │   ├── devices/
│   │   │   └── ...
│   │   │   └── health/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing / redirect
│   │   ├── globals.css
│   │   └── error.tsx
│   ├── components/
│   │   ├── ui/                        # Shared primitives
│   │   ├── dashboard/                 # Dashboard-specific
│   │   ├── admin/                     # Admin-specific
│   │   ├── layout/                    # Header, nav, footer
│   │   └── providers/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client
│   │   │   └── server.ts              # Server client
│   │   ├── db/
│   │   │   └── prisma.ts              # Prisma client singleton
│   │   ├── auth/
│   │   │   ├── config.ts
│   │   │   └── rbac.ts                # Role checks
│   │   ├── validation/               # Zod schemas
│   │   ├── services/                 # Business logic
│   │   ├── repositories/            # Data access
│   │   └── utils/
│   ├── server/                       # Server-only (optional boundary)
│   │   └── actions/                   # Server Actions if needed
│   ├── types/                        # Shared TypeScript types
│   └── config/                       # Constants, env schema
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
├── middleware.ts
├── .env.example
└── package.json
```

---

## 3. Domain Boundaries

| Domain | Responsibility | Location |
|--------|----------------|----------|
| **Auth** | Session, roles, protected routes | `lib/auth/`, middleware |
| **Measurements** | Ingest, store, query pool data | `lib/services/measurement-service.ts`, `lib/repositories/` |
| **Devices** | Device registration, API keys | `lib/services/device-service.ts` |
| **Logs** | Audit, system events | `lib/services/log-service.ts` |
| **Settings** | Thresholds, config | `lib/services/settings-service.ts` |
| **Dashboard** | Current status, charts | `components/dashboard/`, `app/(dashboard)/` |
| **Admin** | Logs, settings, devices | `components/admin/`, `app/(admin)/admin/` |

---

## 4. Route Organization

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | Public | Landing; redirect to dashboard if authenticated |
| `/login`, `/signup` | Public | Auth pages |
| `/auth/callback` | Public | Supabase OAuth callback |
| `/(dashboard)/*` | User+ | Pool status, history, charts |
| `/(admin)/admin/*` | Admin | Logs, settings, devices |
| `/api/admin/devices` | Admin | Register device (API key issued once) |
| `/api/admin/devices/[id]` | Admin | Delete device and cascade measurements |
| `/api/measurements` | Device (API key) | IoT ingestion |
| `/api/health` | Public | Health check |

---

## 5. Data Model (Prisma)

- **User** – Synced from Supabase Auth; links to Profile
- **Profile** – Extended user data, role
- **Role** – Enum: USER, ADMIN
- **Device** – IoT device; API key hash; belongs to user
- **Measurement** – temperature, pH, chlorine (nullable); deviceId; timestamp
- **SystemLog** – Audit/event log; actor, action, metadata
- **Threshold** – Min/max for temp, pH, chlorine; configurable

---

## 6. IoT Integration Point

- **Endpoint**: `POST /api/measurements`
- **Auth**: `Authorization: Bearer <device_api_key>` or `X-Device-Token: <key>`
- **Flow**: Validate key → validate payload (Zod) → store → log
- **Future**: Rate limit per device; alert on threshold breach

---

## 7. Best-Practice Risks to Watch

1. **Supabase + Prisma**: Supabase Auth uses `auth.users`; Prisma models `Profile` and app-specific tables. Use Supabase RLS or app-level checks; avoid duplicate user tables.
2. **Next.js 15**: `params` and `searchParams` are async; use `await`.
3. **Prisma + Vercel**: Use connection pooling (Supabase pooler) to avoid exhaustion.
4. **Device auth**: Hash API keys; never store plain keys; use constant-time comparison.
