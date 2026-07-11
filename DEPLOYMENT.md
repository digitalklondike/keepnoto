# Keepnoto Deployment

Use this order for releases that include database changes:

1. Apply every new file in `supabase/migrations` to the production Supabase project.
2. Configure these Vercel environment variables for Production and Preview:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SUPPORT_EMAIL`
3. Make sure the address configured by `NEXT_PUBLIC_SUPPORT_EMAIL` is a working mailbox or forwarding alias before inviting users.
4. Run `npm.cmd run check:schema` with the production public environment variables.
5. Run `npm.cmd run test`, `npm.cmd run lint`, and `npm.cmd run build`.
6. Merge `dev` into `main` so Vercel creates the production deployment.
7. Verify Google login, Library loading, saving a link, avatar upload, Archive restore, and permanent deletion.

The app has rollout fallbacks for the atomic save and distributed rate-limit RPCs, so an older database does not take down the Library. Those fallbacks are temporary compatibility paths, not a replacement for applying migrations.
