# Keepnoto

Keepnoto is a saved-links library focused on preserving why a link was worth saving.

## Local development

Create `.env.local` with the public Supabase project values:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SUPPORT_EMAIL=support@keepnoto.app
```

Then run:

```powershell
npm.cmd install
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run build
npm.cmd run build-storybook
npm.cmd run check:schema
```

## Database changes

Supabase SQL lives in `supabase/migrations`. Apply new migrations before deploying the matching application code. See `DEPLOYMENT.md` for the release order.
