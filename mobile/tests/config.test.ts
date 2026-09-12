import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import eas from '../eas.json';
test.each([
  ['development', 'com.petid.app.dev'], ['preview', 'com.petid.app.preview'], ['production', 'com.petid.app'],
])('configuration has isolated %s application identifiers', (variant, identifier) => {
  const previous = process.env.APP_VARIANT;
  try {
    process.env.APP_VARIANT = variant;
    jest.isolateModules(() => {
      const config = jest.requireActual('../app.config').default;
      expect(config.android.package).toBe(identifier);
      expect(config.ios.bundleIdentifier).toBe(identifier);
      expect(config.extra).toEqual({ demoMode: true });
      for (const file of [config.icon, config.android.adaptiveIcon.foregroundImage]) {
        expect(existsSync(join(__dirname, '..', file))).toBe(true);
      }
    });
  } finally {
    if (previous === undefined) delete process.env.APP_VARIANT;
    else process.env.APP_VARIANT = previous;
  }
});
test('EAS test profiles only target internal APK, with no submission or credentials', () => {
  expect(eas.build.development.developmentClient).toBe(true);
  expect(eas.build.development.android.buildType).toBe('apk');
  expect(eas.build.preview.distribution).toBe('internal');
  expect(eas.build.preview.android.buildType).toBe('apk');
  expect(eas).not.toHaveProperty('submit');
  expect(JSON.stringify(eas)).not.toMatch(/password|token|keystore|credentials/i);
});
test('mobile application sources have no deferred SDK imports or WebView/DOM wrapper', () => {
  const root = join(__dirname, '..', 'src');
  const files = readdirSync(root, { recursive: true }).map(String).filter((file) => /\.(ts|tsx)$/.test(file));
  const source = files.map((file) => readFileSync(join(root, file), 'utf8')).join('\n');
  expect(source).not.toMatch(/WebView|document\.|window\.|Gemini|Telegram|Pixel Pet|game_states|premium-upgrade/);
  expect(source).not.toMatch(/from ['"][^'"]*app\/src/);
});
