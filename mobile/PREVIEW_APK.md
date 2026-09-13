# Standalone Android preview

The preview-apk Actions job builds APP_VARIANT=preview with Gradle assembleRelease.
The Hermes JavaScript bundle is embedded and React Native development support disabled.
The generated Expo template's debug test certificate signs the APK, never a production
keystore. This is a sideload-only demo, not a Play Store release.

Package: com.petid.app.preview; version 0.1.0 / 1.
ABIs: arm64-v8a (phones), x86_64 (emulators).
CI checks the bundle, signature, package and non-debuggable manifest. Artifact
petid-v1-preview-apk contains the APK plus size/hash/metadata and lasts 14 days.
Generated native files and APKs are ignored and never committed.

PR #7 on the slice-3 branch runs automatically. Future same-repository PRs opt in
with the preview-apk label. Forks cannot run it. Quality runs first and newer builds
cancel superseded native builds.

No Supabase variables or dotenv are included. Missing configuration starts demo mode.
Messages/listings are demo and reports are not submitted. No real backend, EAS,
production signing or publication is involved.

Cold start, picker recovery, photo/document/location permissions, large font and
predictive-back QA are separate from build verification.
