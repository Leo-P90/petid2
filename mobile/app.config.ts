import type { ExpoConfig } from 'expo/config';
const variant = process.env.APP_VARIANT ?? 'development';
if (!['development', 'preview', 'production'].includes(variant)) throw new Error('Invalid APP_VARIANT');
const suffix = variant === 'production' ? '' : variant === 'preview' ? '.preview' : '.dev';
// Provisional identifiers; confirm ownership before any store/signing setup.
const identifier = 'com.petid.app' + suffix;
const config: ExpoConfig = {
  name: variant === 'production' ? 'PetID' : 'PetID ' + (variant === 'preview' ? 'Preview' : 'Dev'),
  slug: 'petid-mobile', version: '0.1.0', orientation: 'portrait',
  scheme: 'petid' + (suffix ? '-' + suffix.slice(1) : ''), userInterfaceStyle: 'automatic',
  icon: './assets/images/icon.png',
  ios: { bundleIdentifier: identifier, supportsTablet: false },
  android: { package: identifier, softwareKeyboardLayoutMode: 'resize', predictiveBackGestureEnabled: true,
    adaptiveIcon: { foregroundImage: './assets/images/android-icon-foreground.png', backgroundColor: '#116C61' },
    blockedPermissions: ['android.permission.RECORD_AUDIO', 'android.permission.ACCESS_BACKGROUND_LOCATION'],
  },
  web: { output: 'static', favicon: './assets/images/favicon.png' },
  plugins: [
    'expo-router', 'expo-dev-client',
    ['expo-image-picker', { photosPermission: 'PetID profilinize fotoğraf seçmek için galerinize erişir.', cameraPermission: false, microphonePermission: false }],
    ['expo-location', { locationWhenInUsePermission: 'PetID kayıp veya yaralı ilan taslağı için konumunuzu yalnızca isteğiniz üzerine kullanır.' }],
    'expo-document-picker',
    ['expo-splash-screen', { image: './assets/images/splash-icon.png', imageWidth: 120, backgroundColor: '#F3F8F7', dark: { backgroundColor: '#102826' } }],
  ],
  experiments: { typedRoutes: true },
  extra: { demoMode: true },
};
export default config;
