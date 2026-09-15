import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../src/state/app-state';
import { Button, Label } from '../src/components/ui';
import Home from '../src/app/(tabs)/index';
import Profile from '../src/app/profile';
import Match from '../src/app/(tabs)/match';
import Reports from '../src/app/reports';
import Adoption from '../src/app/adoption/index';
import Emergency from '../src/app/emergency';
import Health from '../src/app/(tabs)/health';
import { nativeServices } from '../src/services/native';
import { adoptionListings } from '../src/core/model';
import { THEME_KEY } from '../src/core/theme';
import { AccessibilityInfo, Keyboard, Linking } from 'react-native';
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useLocalSearchParams: jest.fn(() => ({})) }));
jest.mock('../src/services/native', () => ({
  nativeServices: { pickPhotos: jest.fn(), locate: jest.fn(), pickFile: jest.fn(), contact: jest.fn() },
}));
const storage = { getItem: jest.fn(async () => null as string | null), setItem: jest.fn(async () => undefined) };
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 24, right: 0, bottom: 24, left: 0 } };
async function mount(child: React.ReactNode) {
  return render(<SafeAreaProvider initialMetrics={metrics}><AppProvider storage={storage}>{child}</AppProvider></SafeAreaProvider>);
}
beforeEach(() => { storage.getItem.mockResolvedValue(null); jest.mocked(nativeServices.locate).mockClear(); jest.requireMock('expo-router').useLocalSearchParams.mockReturnValue({}); });
test('profile focus/edit/save keeps keyboard-friendly scrolling and pet separation', async () => {
  const listener = jest.spyOn(Keyboard, 'addListener');
  const view = await mount(<Profile />);
  expect(listener).toHaveBeenCalledWith('keyboardDidShow', expect.any(Function));
  expect(listener).toHaveBeenCalledWith('keyboardDidHide', expect.any(Function));
  await fireEvent.press(screen.getByRole('button', { name: 'Profili düzenle' }));
  await fireEvent(screen.getByLabelText('Hayvanın adı'), 'focus', { nativeEvent: { target: 1 } });
  await fireEvent.changeText(screen.getByLabelText('Hayvanın adı'), 'Mia QA');
  await fireEvent.press(screen.getByRole('button', { name: 'Demo profili kaydet' }));
  expect(screen.getByRole('button', { name: 'Mia QA · seçili' })).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Atlas profiline geç' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Profili düzenle' }));
  expect(screen.getByLabelText('Hayvanın adı').props.value).toBe('Atlas');
  await view.unmount();
  listener.mockRestore();
});
test('home pet-first routes, Acil actions and pet selection stay reachable', async () => {
  await mount(<Home />);
  for (const label of ['Mia profilini aç', 'Profili ve dijital kimliği aç', 'PatiMatch keşfi', 'Sahiplendirme ilanları', 'Yaralı veya kayıp hayvan bildir', 'Yakındaki açık veterineri bul']) {
    expect(screen.getByRole('button', { name: label })).toBeTruthy();
  }
  expect(screen.getByText('Fotoğraf ekle ›')).toBeTruthy();
  expect(nativeServices.locate).not.toHaveBeenCalled();
  expect(screen.queryByText(/Gemini|Pixel Pet|Pati Market|Eğitim/)).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Hayvan değiştir' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Atlas profiline geç' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Seçimi kapat' }));
  expect(screen.getByRole('button', { name: 'Atlas profilini aç' })).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Sahiplendirme ilanları' }));
  const { router } = jest.requireMock('expo-router');
  expect(router.push).toHaveBeenCalledWith('/adoption');
  await fireEvent.press(screen.getByRole('button', { name: 'Yaralı veya kayıp hayvan bildir' }));
  expect(router.push).toHaveBeenCalledWith({ pathname: '/reports', params: { source: 'street' } });
  await fireEvent.press(screen.getByRole('button', { name: 'Yakındaki açık veterineri bul' }));
  expect(router.push).toHaveBeenCalledWith({ pathname: '/emergency', params: { from: 'home' } });
  await fireEvent.press(screen.getByRole('button', { name: 'Pamuk örnek ilan detayını aç' }));
  expect(router.push).toHaveBeenCalledWith({ pathname: '/adoption/[id]', params: { id: 'demo-pamuk' } });
});
test('photo addition stays with selected pet; denial is visible', async () => {
  jest.mocked(nativeServices.pickPhotos).mockResolvedValue({ status: 'success', value: ['file:///mia.jpg'] });
  await mount(<Profile />);
  await fireEvent.press(screen.getByRole('button', { name: 'Galeriden fotoğraf seç' }));
  await waitFor(() => expect(screen.getByLabelText('Mia fotoğraf 1')).toBeTruthy());
  await fireEvent.press(screen.getByRole('button', { name: 'Atlas profiline geç' }));
  expect(screen.queryByLabelText('Mia fotoğraf 1')).toBeNull();
  jest.mocked(nativeServices.pickPhotos).mockResolvedValue({ status: 'denied', canAskAgain: false });
  await fireEvent.press(screen.getByRole('button', { name: 'Galeriden fotoğraf seç' }));
  await waitFor(() => expect(screen.getByText(/İzin kapalı/)).toBeTruthy());
  await fireEvent.press(screen.getByRole('button', { name: 'Mia profiline geç' }));
  expect(screen.getByLabelText('Mia fotoğraf 1')).toBeTruthy();
});
test('match requires opt-in and never invents mutual matches', async () => {
  await mount(<Match />);
  expect(screen.queryByText('Luna')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'PatiMatch ayarları' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Demo keşfine katıl' }));
  expect(screen.getByText('Luna')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Beğen · demo' }));
  await waitFor(() => expect(screen.getByText('Ada')).toBeTruthy());
  await fireEvent.press(screen.getByRole('button', { name: 'Mesajlar' }));
  expect(screen.getByText(/Henüz eşleşme yok/)).toBeTruthy();
});
test('mutual demo conversation supports reduced motion, keyboard composer and isolated pets', async () => {
  const motion = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  const listener = jest.spyOn(Keyboard, 'addListener');
  const view = await mount(<Match />);
  await fireEvent.press(screen.getByRole('button', { name: 'PatiMatch ayarları' }));
  await waitFor(() => expect(screen.getByText('Azaltılmış hareket açık')).toBeTruthy());
  await fireEvent.press(screen.getByRole('button', { name: 'Demo keşfine katıl' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Geç' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Beğen · demo' }));
  expect(screen.getByText('Karşılıklı demo eşleşme!')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Mesaj gönder' }));
  expect(screen.getByRole('button', { name: 'Demo mesajı gönder' }).props.accessibilityState.disabled).toBe(true);
  expect(listener).toHaveBeenCalledWith('keyboardDidShow', expect.any(Function));
  await fireEvent(screen.getByLabelText('Demo mesaj'), 'focus', { nativeEvent: { target: 1 } });
  await fireEvent.changeText(screen.getByLabelText('Demo mesaj'), '<b>plain text</b>');
  await fireEvent.press(screen.getByRole('button', { name: 'Demo mesajı gönder' }));
  expect(screen.getAllByText('<b>plain text</b>').length).toBeGreaterThan(0);
  expect(screen.getByLabelText('Demo mesaj').props.value).toBe('');
  await fireEvent.press(screen.getByRole('button', { name: 'Konuşmayı kapat' }));
  await fireEvent.press(screen.getByRole('button', { name: 'PatiMatch ayarları' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Atlas profiline geç' }));
  expect(screen.queryByText('Ada')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'PatiMatch ayarları' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Demo keşfine katıl' }));
  expect(screen.getByText('Max')).toBeTruthy();
  await view.unmount(); motion.mockRestore(); listener.mockRestore();
});
test('report denial remains recoverable with manual coordinates; never publishes', async () => {
  jest.mocked(nativeServices.locate).mockResolvedValue({ status: 'denied', canAskAgain: true });
  jest.mocked(nativeServices.pickPhotos).mockResolvedValue({ status: 'success', value: ['file:///street.jpg'] });
  await mount(<Reports />);
  await fireEvent.press(screen.getByRole('button', { name: 'Cihaz konumunu al' }));
  await waitFor(() => expect(screen.getByText(/İzin verilmedi/)).toBeTruthy());
  await fireEvent.changeText(screen.getByLabelText('Enlem'), '41');
  await fireEvent.changeText(screen.getByLabelText('Boylam'), '29');
  await fireEvent.press(screen.getByRole('button', { name: 'Koordinatları önizle' }));
  expect(screen.getByRole('button', { name: 'Yayınlamadan demo taslağı ekle' }).props.accessibilityState.disabled).toBe(true);
  await fireEvent.press(screen.getByRole('button', { name: 'Cihazdan fotoğraf seç' }));
  await waitFor(() => expect(screen.getByLabelText('Taslak fotoğrafı')).toBeTruthy());
  await fireEvent.changeText(screen.getByLabelText('İlan açıklaması'), 'Parkta görüldü');
  await fireEvent.press(screen.getByRole('button', { name: 'Yayınlamadan demo taslağı ekle' }));
  expect(screen.getByText('Kayıp · Yardıma ihtiyacı var · Mia · Parkta görüldü')).toBeTruthy();
  expect(screen.getByText(/Gerçek ilan yayınlanmadı/)).toBeTruthy();
});
test('street report starts with another animal, accepts manual address and requires preview fields', async () => {
  jest.requireMock('expo-router').useLocalSearchParams.mockReturnValue({ source: 'street' });
  jest.mocked(nativeServices.pickPhotos).mockResolvedValue({ status: 'success', value: ['file:///street.jpg'] });
  await mount(<Reports />);
  expect(screen.getByRole('button', { name: 'Başka hayvan için · profil hayvanına geç' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Yayınlamadan demo taslağı ekle' }).props.accessibilityState.disabled).toBe(true);
  await fireEvent.press(screen.getByRole('button', { name: 'Cihazdan fotoğraf seç' }));
  await fireEvent.changeText(screen.getByLabelText('Adres / yakın nokta (elle giriş)'), 'Park girişi');
  await fireEvent.changeText(screen.getByLabelText('İlan açıklaması'), 'Yardıma ihtiyacı var');
  expect(screen.getByText('Park girişi')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Yayınlamadan demo taslağı ekle' }));
  expect(screen.getByText(/Taslak yalnızca cihaz oturumunda/)).toBeTruthy();
  expect(nativeServices.locate).not.toHaveBeenCalled();
});
test('veterinary search asks contextually then offers manual address after denied location', async () => {
  jest.requireMock('expo-router').useLocalSearchParams.mockReturnValue({ from: 'home' });
  jest.mocked(nativeServices.locate).mockResolvedValue({ status: 'denied', canAskAgain: false });
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  await mount(<Emergency />);
  await waitFor(() => expect(screen.getByText(/Adres veya semti elle girebilirsiniz/)).toBeTruthy());
  expect(open).not.toHaveBeenCalled();
  await fireEvent.changeText(screen.getByLabelText('Adres / semt (elle giriş)'), 'Kadıköy');
  await fireEvent.press(screen.getByRole('button', { name: 'Haritada veteriner ara' }));
  await waitFor(() => expect(open).toHaveBeenCalledWith(expect.stringContaining('veteriner')));
  expect(screen.getByText(/Açık saatleri ve iletişim bilgisini doğrulayın/)).toBeTruthy();
  open.mockRestore();
});
test('adoption cards are reachable and explicitly examples', async () => {
  await mount(<Adoption />);
  expect(screen.getByRole('button', { name: 'Pamuk örnek detayını aç' })).toBeTruthy();
  expect(adoptionListings.every(row => row.demo)).toBe(true);
  expect(screen.getByLabelText('Pamuk örnek fotoğrafı')).toBeTruthy();
  expect(screen.getByLabelText('Zeytin örnek fotoğrafı')).toBeTruthy();
  expect(screen.getByText(/Gerçek ilan veya başvuru yok/)).toBeTruthy();
});
test('adoption species filter preserves reachable demo details', async () => {
  await mount(<Adoption />);
  await fireEvent.press(screen.getByRole('button', { name: 'Kediler' }));
  expect(screen.getByRole('button', { name: 'Pamuk örnek detayını aç' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Zeytin örnek detayını aç' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Köpekler' }));
  expect(screen.getByRole('button', { name: 'Zeytin örnek detayını aç' })).toBeTruthy();
});
test('health tabs retain empty records and device document selection', async () => {
  await mount(<Health />);
  await fireEvent.press(screen.getByRole('button', { name: 'Kilo kayıtlarını aç' }));
  expect(screen.getByText('Henüz ölçüm yok')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'İlaçlar' }));
  expect(screen.getAllByText('Henüz kayıt yok').length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: 'Cihazdan belge seç' })).toBeTruthy();
});
function ThemeProbe() {
  const { mode, ready, toggleTheme, notice } = useApp();
  return <><Label>{ready ? mode : 'loading'}</Label><Button label="toggle" onPress={() => void toggleTheme()} /><Label>{notice}</Label></>;
}
test('stored theme loads without overwriting it and toggle persists', async () => {
  storage.getItem.mockResolvedValue('dark');
  await mount(<ThemeProbe />);
  await waitFor(() => expect(screen.getByText('dark')).toBeTruthy());
  expect(storage.setItem).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('button', { name: 'toggle' }));
  await waitFor(() => expect(storage.setItem).toHaveBeenCalledWith(THEME_KEY, 'light'));
});
test('storage failures are visible instead of claimed persistence', async () => {
  storage.setItem.mockRejectedValueOnce(new Error('full'));
  await mount(<ThemeProbe />);
  await waitFor(() => expect(screen.getByText('light')).toBeTruthy());
  await fireEvent.press(screen.getByRole('button', { name: 'toggle' }));
  await waitFor(() => expect(screen.getByText(/cihazda saklanamadı/)).toBeTruthy());
});
