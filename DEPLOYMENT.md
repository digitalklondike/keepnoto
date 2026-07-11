# Keepnoto Deployment

Use this order for releases that include database changes:

1. Apply every new file in `supabase/migrations` to the production Supabase project.
2. Run `npm.cmd run check:schema` with the production public environment variables.
3. Merge `dev` into `main` so Vercel creates the production deployment.
4. Verify login, Library loading, saving a link, Archive restore, and permanent deletion.

The application can still load existing Library data when the Archive column is temporarily missing, but Archive actions require the current migration. This fallback prevents a partial rollout from taking down the main Library; it does not replace applying migrations.