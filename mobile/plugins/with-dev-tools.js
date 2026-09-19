const { withAndroidManifest } = require('expo/config-plugins');
// Keep Expo Dev Menu accessible via the emulator Menu key, without a content overlay.
module.exports = config => withAndroidManifest(config, next => {
  const application = next.modResults.manifest.application[0];
  const metadata = application['meta-data'] ?? [];
  const name = 'EXDevMenuShowFloatingActionButton';
  application['meta-data'] = [...metadata.filter(item => item.$['android:name'] !== name),
    { $: { 'android:name': name, 'android:value': 'false' } }];
  return next;
});
