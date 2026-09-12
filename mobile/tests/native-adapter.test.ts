import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { nativeServices } from '../src/services/native';
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(), launchImageLibraryAsync: jest.fn(),
}));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(), hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(), Accuracy: { Balanced: 3 },
}));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
beforeEach(() => {
  jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({ granted: true, canAskAgain: true } as Location.LocationPermissionResponse);
  jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true);
});
afterEach(() => { jest.useRealTimers(); });
test('foreground location adapter returns only coordinates', async () => {
  jest.mocked(Location.getCurrentPositionAsync).mockResolvedValue({ coords: { latitude: 41, longitude: 29 } } as Location.LocationObject);
  expect(await nativeServices.locate()).toEqual({ status: 'success', value: { latitude: 41, longitude: 29 } });
  expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: Location.Accuracy.Balanced });
});
test('disabled location services do not start an acquisition', async () => {
  jest.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(false);
  expect((await nativeServices.locate()).status).toBe('error');
  expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
});
test('unresponsive GPS is bounded and permission denial never acquires location', async () => {
  jest.useFakeTimers();
  jest.mocked(Location.getCurrentPositionAsync).mockImplementation(() => new Promise(() => {}));
  const result = nativeServices.locate();
  await jest.advanceTimersByTimeAsync(20000);
  expect((await result).status).toBe('error');
  expect(jest.getTimerCount()).toBe(0);
  jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({ granted: false, canAskAgain: false } as Location.LocationPermissionResponse);
  expect(await nativeServices.locate()).toEqual({ status: 'denied', canAskAgain: false });
  expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
});
test('gallery adapter requests images only with a five-photo cap', async () => {
  jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({ granted: true, canAskAgain: true } as ImagePicker.MediaLibraryPermissionResponse);
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///photo.jpg', width: 100, height: 100 }] });
  expect(await nativeServices.pickPhotos()).toEqual({ status: 'success', value: ['file:///photo.jpg'] });
  expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 5, quality: 0.8 });
});
