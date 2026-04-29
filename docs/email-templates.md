# AquaSense Email Templates

Modern, consistent email templates for Supabase Auth, aligned with the AquaSense design system and app UI.

## Overview

Templates are stored in `supabase/email-templates/`:

| Template | File | Supabase Dashboard Name |
|----------|------|-------------------------|
| Confirm sign up | `confirm-signup.html` | Confirm signup |
| Invite user | `invite-user.html` | Invite user |
| Magic link | `magic-link.html` | Magic link |
| Change email address | `change-email.html` | Change email address |
| Reset password | `reset-password.html` | Reset password |
| Reauthentication | `reauthentication.html` | Reauthentication |

## Logo Setup

Templates use `{{ .SiteURL }}/logo.png` for the logo. You must serve a logo at the root of your app.

### Option 1: PNG (recommended for email)

1. Add `logo.png` to `public/` (e.g. 240×64px or 120×32px). You can export from `public/logo.svg` using an image editor or [CloudConvert](https://cloudconvert.com/svg-to-png).
2. When deployed, it will be at `https://your-app.vercel.app/logo.png`.
3. Set **Site URL** in Supabase (Authentication → URL Configuration) to your app URL.

### Option 2: SVG fallback

Some email clients block external images. Each template includes a text fallback: if the image fails to load, "AquaSense" is shown as styled text.

### Option 3: Local development

For local testing, set Site URL to `http://localhost:3000` and ensure `public/logo.png` exists. The logo will load when the dev server is running.

## Applying Templates (Hosted Supabase)

For **hosted** Supabase projects, templates are configured in the Dashboard:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. **Authentication** → **Email Templates**.
3. For each template (e.g. "Confirm signup"):
   - Click the template.
   - Set **Subject** (see table below).
   - Switch to **Source** view.
   - Paste the HTML from the corresponding file in `supabase/email-templates/`.
   - Save.

### Subject lines

| Template | Suggested subject |
|----------|-------------------|
| Confirm signup | `Confirm your signup` |
| Invite user | `You're invited to AquaSense` |
| Magic link | `Your sign-in link` |
| Reset password | `Reset your password` |
| Change email address | `Confirm email change` |
| Reauthentication | `Confirm your identity` |

## Local Development (Supabase CLI)

If you use Supabase locally with `supabase start`, configure templates via `config.toml`:

```toml
[auth.email.template.confirmation]
subject = "Confirm your signup"
content_path = "./supabase/email-templates/confirm-signup.html"

[auth.email.template.invite]
subject = "You're invited to AquaSense"
content_path = "./supabase/email-templates/invite-user.html"

[auth.email.template.magic_link]
subject = "Your sign-in link"
content_path = "./supabase/email-templates/magic-link.html"

[auth.email.template.recovery]
subject = "Reset your password"
content_path = "./supabase/email-templates/reset-password.html"

[auth.email.template.email_change]
subject = "Confirm email change"
content_path = "./supabase/email-templates/change-email.html"

[auth.email.template.reauthentication]
subject = "Confirm your identity"
content_path = "./supabase/email-templates/reauthentication.html"
```

Then restart: `supabase stop && supabase start`.

Reference: [Customizing email templates](https://supabase.com/docs/guides/local-development/customizing-email-templates)

## Template Variables

Supabase provides these [template variables](https://supabase.com/docs/guides/auth/auth-email-templates#terminology):

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | Link for confirm, invite, magic link, reset, email change |
| `{{ .Token }}` | 6-digit OTP (reauthentication) |
| `{{ .SiteURL }}` | App Site URL from auth settings |
| `{{ .Email }}` | User email |
| `{{ .NewEmail }}` | New email (change email template only) |

## Design Consistency with AquaSense app

Templates match the app's visual language:

| Element | App (Tailwind) | Email |
|---------|----------------|-------|
| Background | `bg-canvas` (#f0f9ff) | `#f0f9ff` |
| Card surface | `bg-surface` (#ffffff) | `#ffffff` |
| Card alt | `bg-surface-alt` (#f8fafc) | `#f8fafc` |
| Border | `border-border-subtle` (#e2e8f0) | `#e2e8f0` |
| Accent | `accent` (#0ea5e9) | `#0ea5e9` |
| Accent deep | `accent-deep` (#0284c7) | `#0284c7` |
| Text primary | `text-slate-900` (#0f172a) | `#0f172a` |
| Text secondary | `text-slate-600` (#475569) | `#475569` |
| Muted | `text-muted` (#64748b) | `#64748b` |
| Radius | `rounded-xl` (12px) | `12px` |
| Button radius | `rounded-lg` (8px) | `8px` |

**Shared elements:**
- Water accent bar: 4px gradient bar at top (accent → accent-deep)
- Header: logo + "Pool Monitoring" tagline
- CTA buttons: accent background, 12px/24px padding
- Footer: surface-alt background, muted text

## Best Practices Applied

- **Table-based layout**: Reliable across Gmail, Outlook, Apple Mail
- **Inline CSS**: No external stylesheets (blocked by many clients)
- **System fonts**: -apple-system, Segoe UI, Roboto
- **PNG logo**: SVG often blocked; use `logo.png` in `public/`
- **Fallback**: `onerror` shows "AquaSense" text if image fails; `alt` as backup
- **MSO conditionals**: Outlook-specific fixes where needed
- **Mobile-first**: max-width 480px, responsive padding
