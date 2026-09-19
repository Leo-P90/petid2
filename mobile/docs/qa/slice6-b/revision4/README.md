# Revision 4 — shared header and Acil Pati

Source: [PR #12 revision 4](https://github.com/Leo-P90/petid2/pull/12#issuecomment-5742184425). Started from clean `932e209e9298e19fece1179e3e7b2ced29d81886` on `codex/v1-slice-6-ui-b`.

The approved B moodboard and pet-first home layout remain the visual baseline. Home, Health and Services use the same 48 dp pet picker and vector theme control. A pet without a photo uses species line art. The Match photo card and filters retain their approved layout.

Acil Pati now reveals the next section after its required choice: own/other animal, one of three situations, details, audience, then preview. It requires 20–500 description characters, 1–5 reorderable/removable photos, confirmed location or manual address, a past observation time and at least one audience. Location permission is requested only by the location button. A denied permission keeps manual address available. The preview distinguishes an approximate community area from the creator's detail. The final button saves an owner-scoped local demo report and states that no public report was published; the creator can mark it resolved. Typed publication and moderation ports define a future backend boundary without touching live Supabase.

## Emulator evidence

PetID Dev (`com.petid.app.dev`) on Android emulator, 360 dp except where indicated. These are direct `adb screencap` captures, with no image editing. The Preview package (`com.petid.app.preview`) stayed installed.

| Check | Image |
| --- | --- |
| Light shared header | [01-home-light.png](01-home-light.png) |
| Dark shared header | [02-home-dark.png](02-home-dark.png) |
| Health and Services shared header | [16-health-header.png](16-health-header.png), [17-services-header.png](17-services-header.png) |
| Pet switching sheet | [03-pet-sheet.png](03-pet-sheet.png) |
| Initial report choice | [04-report-step1.png](04-report-step1.png) |
| Other animal and three exclusive situations | [05-other-three-states.png](05-other-three-states.png) |
| Description with open Gboard | [06-gboard-description.png](06-gboard-description.png) |
| System photo picker | [07-photo-picker.png](07-photo-picker.png) |
| Permission denial and manual address | [08-location-denied.png](08-location-denied.png) |
| Manual address and schematic location preview | [09-location-map.png](09-location-map.png) |
| Completed details, upper and lower | [09-completed-info-upper.png](09-completed-info-upper.png), [09-completed-info-lower.png](09-completed-info-lower.png) |
| Audience toggles | [10-audience.png](10-audience.png) |
| Final preview before local save | [11-preview.png](11-preview.png) |
| Local-only saved report | [12-local-save.png](12-local-save.png) |
| 320 dp home and report choices | [13-home-header-320.png](13-home-header-320.png), [15-other-states-320.png](15-other-states-320.png) |

## Checks and limits

TypeScript, lint, 16 Jest suites / 110 tests, Android JS export and web export (19 routes) passed on 2026-09-19. Expo Doctor passed 20/21: seven existing Expo SDK 57 packages are one patch behind its current recommendation. This revision did not upgrade dependencies. Native Android `:app:assembleDebug -PreactNativeArchitectures=x86_64` passed (495 tasks) using the existing local short-path Gradle init script. An initial long-path CMake/Ninja attempt had failed with `build.ninja still dirty after 100 tries`; the short-path build resolved that. With no native source or dependency changes, `:app:packageDebug` was up-to-date. The resulting Dev 0.3.0 APK is 97,008,098 bytes, SHA-256 `E4928EF88C7E7FD135E83B95D29963EC6FBDAD1C62DF809053F7BB8C0F4EA3BF`; `adb install -r` succeeded. The revised JS loaded from a cache-cleared Metro server. The first Metro process stopped responding on port 8081; replacing it restored a clean launch. Dev local data was backed up before troubleshooting and restored afterward. Final captures show no developer menu or error overlay. This is a development-client build requiring Metro, not a standalone production APK. Preview was not uninstalled.

Intentional differences from a networked emergency service: the map is a clearly labeled schematic and manual addresses are not geocoded or verified pins; saved reports remain on this device, so audience choices are preview intent rather than actual distribution; no veterinary response or moderation service is claimed. The preview photo is a local QA fixture chosen through the system picker, not a real emergency animal image. No production or live Supabase operation occurred. Demo pets without user photos use species line art, consistent with the approved visual fallback.
