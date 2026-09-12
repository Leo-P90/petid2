# Local Supabase verification

No live project is linked by this slice. With Docker Desktop running, validate the migration and the two-user/anonymous RLS matrix locally:

```sh
npx --yes supabase@2.117.0 start
npx --yes supabase@2.117.0 db reset
npx --yes supabase@2.117.0 test db
npx --yes supabase@2.117.0 db lint --level warning
npx --yes supabase@2.117.0 stop
```

Copy `.env.example` to an ignored local environment file only for an explicitly approved test project. Use its public project URL and publishable key; never place a service-role key in the mobile application.

The mobile configuration intentionally accepts only hosted `https://<project-ref>.supabase.co` URLs and `sb_publishable_` keys. Local CLI URLs, custom domains, legacy anon keys, service-role keys, and secret keys are rejected as unconfigured instead of being sent from the client.
