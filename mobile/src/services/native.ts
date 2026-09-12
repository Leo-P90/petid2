import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as DocumentPicker from 'expo-document-picker';
import { Linking, Platform } from 'react-native';
import { createServices } from '../core/services';
export const nativeServices = createServices({
  photoPermission: async () => Platform.OS === 'web'
    ? { granted: true, canAskAgain: true }
    : ImagePicker.requestMediaLibraryPermissionsAsync(),
  photoPicker: async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 5, quality: 0.8,
    });
    return { canceled: result.canceled, uris: result.assets?.map((asset) => asset.uri) ?? [] };
  },
  locationPermission: () => Location.requestForegroundPermissionsAsync(),
  locate: async () => {
    if (!(await Location.hasServicesEnabledAsync())) throw new Error('Location disabled');
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Location timeout')), 20000);
      });
      const result = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), timeout,
      ]);
      return { latitude: result.coords.latitude, longitude: result.coords.longitude };
    } finally { clearTimeout(timer); }
  },
  filePicker: async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'], copyToCacheDirectory: true, multiple: false,
    });
    return { canceled: result.canceled, files: result.assets ?? [] };
  },
  openURL: (url) => Linking.openURL(url),
});
