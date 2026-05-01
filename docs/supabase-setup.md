# Supabase Setup for AquaSense

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Wait for the database to be provisioned

## 2. Get connection details

In Project Settings > API:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

In Project Settings > Database:

- Copy the connection string (URI format)
- For **pooled** (recommended for serverless): use port **6543** and append `?pgbouncer=true`
- For **direct** (migrations): use port **5432**

Example:

```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

## 3. Auth configuration

In Authentication > URL Configuration:

- **Site URL**: `http://localhost:3000` (dev) or your production origin (must match the URL users open in the browser)
- **Redirect URLs**: Allowlist every origin that will complete OAuth, for example:
  - `http://localhost:3000/auth/callback`
  - `https://your-production-domain.com/auth/callback`
  - If Supabase shows a wildcard option for the same path, you may use it so query parameters (for example `?next=/dashboard`) still match; otherwise add the exact URLs you use.

In Authentication > Providers:

- Enable **Email** provider
- Optionally disable email confirmation for local dev (Authentication > Providers > Email > Confirm email)

The sign-up UI treats three outcomes after `signUp`: an immediate session (user lands on the dashboard), no session but a **new** user with at least one identity (email confirmation required — we show an on-page notice), or an existing email (often **no session** and either **no user** or a user with **empty `identities`** — we redirect to `/login` with `error=signup_email_in_use` so the user sees a clear message instead of a silent bounce via `/dashboard`).

### Google (Sign in with Google)

The app uses Supabase OAuth (`signInWithOAuth`) with the **Google** provider. No Google client secret is stored in this repository; Supabase holds provider credentials.

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project.
2. **APIs & Services** → **OAuth consent screen**: configure the app (type, support email, scopes; `openid`, `email`, and `profile` are sufficient for typical sign-in).
3. **Credentials** → **Create credentials** → **OAuth client ID** → Application type **Web application**:
   - **Authorized JavaScript origins**: not required for the server-side Supabase redirect flow; you may leave empty or add your site URL if you use other Google JS APIs.
   - **Authorized redirect URIs**: add the value from Supabase **Authentication** → **Providers** → **Google** → **Callback URL** (looks like `https://<project-ref>.supabase.co/auth/v1/callback`). This is where Google sends the user after consent; Supabase then redirects to your app’s `/auth/callback`.
4. Copy the **Client ID** and **Client secret** into Supabase **Authentication** → **Providers** → **Google**, and enable the provider.

After a successful Google sign-in, the app exchanges the code at `/auth/callback` and creates or loads the user’s row in `profiles` on first dashboard visit (same as email sign-up).

## 4. Run migrations

Prisma manages the schema. Supabase Auth uses its own `auth.users` table; our `profiles` table is separate and linked by `userId`.

```bash
npx prisma db push
# or for migrations:
npx prisma migrate dev
```

## 5. Optional: Supabase RLS

AquaSense uses app-level authorization (Prisma + role checks). If you want to add Supabase RLS for direct Postgres access, create policies that align with our `Profile` and `Device` model.
