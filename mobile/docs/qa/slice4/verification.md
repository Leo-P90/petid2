# Issue 8 core data verification

Base and PR 7 head inspected: 232e49e9ff57cbc92694560de02ee09ee8dd6312.
Separate clone and branch: codex/v1-slice-4-core-data. No design branch writes.

Implemented native health CRUD (vaccine, medication, weight, exam, general), private documents, owner/pet relational constraints, owner RLS for every operation, Storage owner/pet path checks, explicit authenticated grants, 10 MB and MIME validation, fresh 5-minute document signed links, upload rollback and pet deletion document cleanup. Account state remounts on user/mode change; health state remounts on pet/user change. Existing design tokens/screens retained. Record deletion preserves attached documents as standalone records.

Verified locally on Windows, Node 24.18.0:
- npm ci: passed
- TypeScript: passed
- ESLint: passed
- Jest: 11 suites, 61 tests passed
- Android JS export: passed
- Web static export: passed (19 routes)
- Expo Doctor: 21/21 passed
- Supabase CLI 2.117.0: version, help, migration new, reset/lint/advisors/test help checked

Not passed / blockers:
- Docker Desktop 4.79.0 stops during startup: initializing Inference manager cannot listen on dockerInference socket (file cannot be accessed / invalid filename). Supabase start then reports missing dockerDesktopLinuxEngine pipe.
- Therefore Windows local reset, DB lint/advisors, pgTAP and two-user API/Storage matrix have NOT run. They are included in core-data-local.yml against an ephemeral Linux local stack; CI results must be checked before treating security verification as complete.
- adb devices: empty. Android signup/login/pet/photo/health/document relaunch and keyboard/safe-area manual E2E NOT run.
- File removal and metadata deletion are separate API calls; failures are surfaced and retry is supported, but this is not a distributed transaction. Already issued signed links expire rather than being revoked by logout.

Run the local security matrix after starting Docker:
1. From mobile: npx --yes supabase@2.117.0 start
2. npx --yes supabase@2.117.0 db reset --local --no-seed --yes
3. npx --yes supabase@2.117.0 db lint --local --fail-on error
4. npx --yes supabase@2.117.0 db advisors --local --type security --fail-on error
5. npx --yes supabase@2.117.0 test db --local
6. Set LOCAL_SUPABASE_PUBLISHABLE_KEY from local status and run node scripts/local-security.mjs. The script rejects non-loopback URLs, uses only synthetic example.test users and no admin secret.

Native local connection: EXPO_PUBLIC_SUPABASE_LOCAL=true, EXPO_PUBLIC_SUPABASE_URL=http://10.0.2.2:54321 on Android emulator (127.0.0.1 on web), EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY from local status. Local mode rejects cloud URLs. Do not commit .env or status output.

Official sources checked on 2026-09-14:
- https://supabase.com/changelog.md
- https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically (explicit grants included)
- https://supabase.com/docs/guides/auth/quickstarts/react-native
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/storage/security/access-control

Stack plan: target codex/v1-slice-3-supabase-foundation (PR 7 source) as draft PR base. Recheck current remote head before push. If it advances, integrate into core-data branch only and rerun checks; never update the design branch. No merge, production, EAS, live project, real user or real secret.
