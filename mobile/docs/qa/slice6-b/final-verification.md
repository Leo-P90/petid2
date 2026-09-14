# Slice 6 B — native verification, 2026-09-15

Source branch: `codex/v1-slice-6-ui-b`, stacked on PR #11 /
`codex/v1-slice-5-match-backend` at `b46b6a5a2fb7e2a1cabcb8b4ceb881adb5fe3f8e`.
This report supersedes the shutdown gates in README.md for the checks below.
Existing working changes were preserved; no reset, clean, restore, legacy Vite,
EAS, merge, production or live backend operations.

## Checks repeated on final source

- `npm run typecheck`, `npm run lint`: PASS.
- `npm test`: PASS, 14 suites / 90 tests.
- `npx expo-doctor`: PASS, 21/21. Initial sandbox network failure was rerun with authorized network access.
- `npm run build:android:js`: PASS, Hermes Android export.
- `npm run build:web`: PASS, 19 static routes.
- `git diff --check`: PASS.
- Local Gradle `:app:assembleDebug -PreactNativeArchitectures=x86_64`: PASS,
  475 tasks, 2m24s. Existing local short-path init script used via P: mapping.
  Java: Android Studio bundled JBR; Android SDK: installed local SDK.

## APK and cold start

`PetID-Dev-0.3.0-B-x86_64.apk`, 92,469,588 bytes; package `com.petid.app.dev`,
versionName `0.3.0`, versionCode `3`. SHA-256:
`BCD480410F0BF3A17C5668346F0B693DF17F10C32D72890748C3C85877E6782A`.
Built from the B working source committed with this report; APK binaries are
delivered separately, not stored in git. This is a **development debug APK
requiring Metro**, x86_64 emulator architecture; not a standalone phone preview.

`adb install -r` succeeded. Both Dev and existing Preview packages remain installed.
Fresh force-stop/deep-link launch loaded the app, main tabs and B screens without
the historical white screen or fatal JS exception. An initial connection failed
because localhost resolved to IPv6 while ADB forwarded IPv4. Reproducible local fix:

```powershell
$env:APP_VARIANT='development'
$env:CI='1'
$env:NODE_OPTIONS='--dns-result-order=ipv4first'
npx expo start --dev-client --localhost --port 8081
# separate terminal:
adb -s emulator-5554 reverse tcp:8081 tcp:8081
adb -s emulator-5554 shell am start -a android.intent.action.VIEW -d 'petid-dev://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081' com.petid.app.dev
```

Metro was verified listening only on `127.0.0.1`. A LAN-binding attempt was rejected
by automatic approval review and not executed; localhost IPv4 resolved the issue.

## Fresh Android QA

Tests ran on emulator-5554, 1080x2400 / density 420, in demo mode:

- B charcoal photo-first discovery, gradient metadata, filled red heart and one
  global bottom bar: PASS. Keşfet/Mesajlar are local segments; settings separate.
- Left swipe Luna -> Ada; undo -> Luna: PASS. Like Luna -> messages remained empty.
- Right swipe Ada -> mutual demo celebration -> chat: PASS.
- Send `B-QA-20260915` -> sent bubble, cleared input and demo reply: PASS.
- Docked Gboard is Google LatinIME, `mInputShown=true`: chat input/send visible;
  profile final field/save visible and save tappable: PASS.
- Native photo picker selected existing explicitly local screenshot fixture;
  Done returned to profile with 1/5 and rendered thumbnail: PASS. Fixture is not
  an animal portrait or design evidence; this was local demo selection, not upload.
- Health 2x2 truthful empty summaries and next-care card, detail tabs/doc chooser
  still accessible: PASS. Light and dark captures attached.
- Services two columns at 320dp (840x1680 / density 420): readable names/metadata,
  descriptions capped at two lines; lower rows reachable by vertical scroll.
  Horizontal category swipe and Pet Oteli filter: PASS.
- Android back returned from Services to the prior Health tab: PASS.
- Hardware keyboard preference restored to 0; display override removed;
  physical 1080x2400 and original Preview preserved.

The prior two-account local backend/session/upload results in README remain
historical. They were not relabeled as fresh account QA; this final run verifies
demo native flows plus the retained account repository/component regression tests.
Photo permission denial, forensic EXIF, native block/report and automatic GPS
remain outside this B acceptance run, as in PR #11.

## Evidence

Before images `b-before-*.png` are historical pre-B captures from 2026-09-14.
New final images: `b-patimatch.png`, `b-messages-dark.png`,
`b-health-light.png`, `b-health-dark.png`, `b-services-light.png`,
`b-services-dark.png`, `b-services-320dp.png`, `b-gboard-chat.png`,
`b-gboard-profile.png`, `b-photo-picker.png`, `b-photo-selected.png`,
`b-cold-start.png`. Expo Dev's floating Tools control is visible in some captures;
it is development tooling and not a second application navigation bar.

Remote push, draft PR head verification and new CI results are recorded in the
PR after creation; local check results alone are not a CI success claim.
