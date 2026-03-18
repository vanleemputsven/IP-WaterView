# Waterview Architecture Review

## Alignment with Best Practices

### Next.js App Router (2025)

| Practice | Status | Notes |
|----------|--------|-------|
| Server Components by default | ✓ | Pages fetch data server-side; client components only where needed (forms, charts) |
| Route groups | ✓ | `(auth)`, `(dashboard)`, `(admin)` for logical grouping without URL segments |
| `force-dynamic` for data pages | ✓ | Dashboard, admin, history use `export const dynamic = "force-dynamic"` |
| Async params/searchParams (Next 15) | ✓ | Not used in current routes; ready when needed |
| No deprecated patterns | ✓ | No `getServerSideProps`; using App Router conventions |

### Prisma + Supabase

| Practice | Status | Notes |
|----------|--------|-------|
| Connection pooling | ✓ | `DATABASE_URL` with `pgbouncer=true` for serverless |
| Direct URL for migrations | ✓ | `DIRECT_URL` for Prisma migrate |
| Singleton client | ✓ | `lib/db/prisma.ts` with dev-mode global to avoid connection exhaustion |
| Schema design | ✓ | Normalized; indexes on query paths; cascade deletes where appropriate |

### Supabase Auth

| Practice | Status | Notes |
|----------|--------|-------|
| @supabase/ssr | ✓ | Using current package (not deprecated auth-helpers) |
| Server + browser clients | ✓ | `lib/supabase/server.ts` and `client.ts` |
| Middleware session refresh | ✓ | `updateSession` refreshes tokens; cookies set on response |
| getClaims vs getSession | ⚠ | Using `getUser()`; Supabase docs recommend `getClaims()` for protection—consider upgrading when available |

### Security

| Practice | Status | Notes |
|----------|--------|-------|
| Zod validation | ✓ | All API inputs validated (measurement ingest) |
| No credential logging | ✓ | No auth secrets in logs |
| API key hashing | ✓ | SHA-256; constant-time comparison considered; direct DB lookup acceptable for IoT scale |
| Role-based access | ✓ | `canAccessAdmin()`; first user gets ADMIN |
| Error handling | ✓ | No stack traces to client; structured error responses |

### Architecture

| Concern | Status |
|---------|--------|
| Separation of concerns | ✓ Routes → services → repositories |
| Domain boundaries | ✓ Auth, measurements, devices, logs, settings |
| Extensibility | ✓ Chlorine nullable; thresholds configurable; alert model ready |
| Type safety | ✓ Strict TypeScript; Prisma types; Zod inference |

## Risks and Follow-ups

1. **Rate limiting**: Not implemented. Add for `/api/measurements` and public endpoints before production.
2. **Device lastSeenAt**: Not updated on measurement ingest. Add in `POST /api/measurements` handler.
3. **Threshold checks**: Thresholds exist but no alerting or "in range" UI yet.
4. **Supabase RLS**: Using app-level auth only. Consider RLS if exposing Supabase client directly.

## Thesis/Demo Readiness

The structure is clear, documented, and defensible:

- Clean folder structure with `src/` separation
- Domain-centric organization (dashboard, admin, measurements)
- Explicit auth and RBAC
- Validation and logging in place
- Seed and demo device flow for testing without hardware
