# Supabase Setup for Waterview

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

- **Site URL**: `http://localhost:3000` (dev) or your production URL
- **Redirect URLs**: Add `http://localhost:3000/auth/callback` and your production callback URL

In Authentication > Providers:

- Enable **Email** provider
- Optionally disable email confirmation for local dev (Authentication > Providers > Email > Confirm email)

## 4. Run migrations

Prisma manages the schema. Supabase Auth uses its own `auth.users` table; our `profiles` table is separate and linked by `userId`.

```bash
npx prisma db push
# or for migrations:
npx prisma migrate dev
```

## 5. Optional: Supabase RLS

Waterview uses app-level authorization (Prisma + role checks). If you want to add Supabase RLS for direct Postgres access, create policies that align with our `Profile` and `Device` model.
