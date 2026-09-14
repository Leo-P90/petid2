# Slice 6 — approved B design: interim QA

Final 2026-09-15 native build, installation, cold-start and fresh B emulator
checks: [final-verification.md](final-verification.md). The shutdown status and
delivery gates below are historical; remote delivery/CI is recorded in the new PR.

Historical checkpoint: **not delivered at shutdown**. Native cold-start, Dev 0.3.0 installation, push,
stacked draft PR, remote/head SHA and new quality CI remain acceptance gates.

Branch: `codex/v1-slice-6-ui-b`, starting commit
`b46b6a5a2fb7e2a1cabcb8b4ceb881adb5fe3f8e`.
Approved scope: [PR #11 comment](https://github.com/Leo-P90/petid2/pull/11#issuecomment-5666430320).
The intended draft PR base is `codex/v1-slice-5-match-backend`.

## Local checks

On 2026-09-15, Node 24.18.0 / npm 11.16.0:

- TypeScript and lint: passed.
- Jest: 14 suites, 90 tests passed (existing 80 plus 10 B regressions).
- Android JS export: passed; **not an APK build**.
- Web export: passed, 19 routes.
- `git diff --check`: passed.
- Expo Doctor: 21/21 passed before shutdown; must be rerun for final delivery.

## Previous emulator session (2026-09-14)

These results are historical, not a successful cold-start check of the final
Dev 0.3.0 binary. Images remain outside the repository in the workspace's
`qa-slice5-local` directory pending final evidence selection.

- Services light/dark: two-column cards, category filtering and local favorites.
- Services at 320 dp: two columns; temporary display override restored.
- Health light/dark: four truthful summary tiles and one next-care card;
  record/file controls accessible in the detail modal.
- Match: one-way like did not create a conversation; mutual like did.
- Two local test accounts exchanged messages; thread preview/unread/read worked.
- System photo picker uploaded an explicitly local QA fixture. This fixture was
  an earlier UI screenshot, not an animal portrait or visual-design evidence.
- Docked Gboard: chat input/send and profile last field/save stayed visible.
  Temporary emulator keyboard preferences were restored.
- Four global bottom routes remained; Match Keşfet/Mesajlar are local segments.

Final fresh launch showed a white screen (`b-relaunch-state.png`). It is a
**failure**, not an accepted screenshot. Metro restart/native rebuild were
interrupted by shutdown. Diagnose against a fresh native build before claiming
runtime acceptance; successful tests/export do not resolve this gate.

## Delivery gates still open

- Rerun Expo Doctor and build native Dev 0.3.0 (development package only).
- Install/launch Dev, preserve the preview package, resolve cold-start failure.
- Recheck final light/dark screens, swipe/actions, keyboard and photo picker.
- Select final before/after screenshots; do not label outdated images as final.
- Commit and normal push, create the approved stacked **draft** PR, verify
  local/origin/PR head SHA, and await new quality CI.
- Report native APK/artifact status accurately. A debug Dev build requiring
  Metro is not a standalone preview APK.

Elevated commands were rejected before execution with an approval-runtime
`parent compaction checkpoint is incompatible with the Guardian review model`
error. This does not establish that Docker or the emulator is offline. No
indirect execution was used to bypass the rejection.

No live Supabase mutation, EAS build, force push, merge or production release.
Education, games and AI are excluded. Automatic GPS success remains deferred.
