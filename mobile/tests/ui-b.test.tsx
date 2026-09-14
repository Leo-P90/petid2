import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../src/state/app-state';
import Services from '../src/app/(tabs)/services';
import Health from '../src/app/(tabs)/health';
import Match, { SwipeCard } from '../src/app/(tabs)/match';
import Home from '../src/app/(tabs)/index';
import TabLayout from '../src/app/(tabs)/_layout';
import { HealthSummary } from '../src/components/health-summary';
import { StyleSheet } from 'react-native';
import { statusBarStyle } from '../src/core/theme';
import { matchDemo } from '../src/data/match-demo';
import { servicesDemo } from '../src/data/services-demo';
import { emptyMatch, matchReducer } from '../src/core/match-model';
jest.mock('@react-native-async-storage/async-storage', () => jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-router', () => {
  const React = jest.requireActual('react'); const { View } = jest.requireActual('react-native');
  const Tabs = Object.assign((props: Record<string, unknown>) => React.createElement(View, { ...props, testID: 'global-tabs' }), { Screen: (props: Record<string, unknown>) => React.createElement(View, { ...props, testID: 'tab-route' }) });
  return { router: { push: jest.fn() }, Tabs };
});
const metrics = { frame: { x: 0, y: 0, width: 320, height: 740 }, insets: { top: 24, bottom: 24, left: 0, right: 0 } };
const mount = (child: React.ReactNode) => render(<SafeAreaProvider initialMetrics={metrics}><AppProvider storage={{ getItem: async () => null, setItem: async () => undefined }}>{child}</AppProvider></SafeAreaProvider>);
test('services grid filters, favorites stay local and detail discloses synthetic source', async () => {
  await mount(<Services />); expect(servicesDemo.every(row => row.source === 'demo')).toBe(true);
  expect(screen.getByTestId('services-grid')).toBeTruthy();
  expect(screen.getAllByRole('button', { name: /detayını aç/ })).toHaveLength(4);
  await fireEvent.press(screen.getByRole('button', { name: 'PatiVet Klinik favori' }));
  expect(screen.getByRole('button', { name: 'PatiVet Klinik favori' }).props.accessibilityState.selected).toBe(true);
  await fireEvent.press(screen.getByRole('button', { name: 'Pet Oteli' }));
  expect(screen.getAllByRole('button', { name: /detayını aç/ })).toHaveLength(1);
  await fireEvent.press(screen.getByRole('button', { name: 'PatiKonak detayını aç' }));
  expect(screen.getByText(/Rezervasyon, ödeme/)).toBeTruthy();
});
test('health overview is four cards; forms/documents only open in detail', async () => {
  await mount(<Health />); expect(screen.getByTestId('health-summary-grid')).toBeTruthy();
  expect(screen.getAllByRole('button', { name: /kayıtlarını aç/ })).toHaveLength(4);
  expect(screen.queryByRole('button', { name: 'Cihazdan belge seç' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Sağlık kayıtları ve belgeler' }));
  expect(screen.getByRole('button', { name: 'Cihazdan belge seç' })).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Sağlık detayını kapat' }));
  expect(screen.queryByRole('button', { name: 'Cihazdan belge seç' })).toBeNull();
});
test('match entry has only local segments and separate settings, not a global top bar', async () => {
  await mount(<Match />); expect(screen.queryByText(/gerçek hesap modu|demo keşfi|Gizlilik ve güvenlik/)).toBeNull();
  for (const label of ['Ana Sayfa', 'Sağlık', 'Hizmetler', 'Profil']) expect(screen.queryByRole('button', { name: label })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Demo keşfine katıl' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'PatiMatch ayarları' }));
  expect(screen.getByRole('button', { name: 'Demo keşfine katıl' })).toBeTruthy();
});
test('filled red like and pass invoke the same guarded card actions under reduced motion', async () => {
  const choose = jest.fn(); await mount(<SwipeCard candidate={matchDemo[0]} choose={choose} reduced live />);
  expect(StyleSheet.flatten(screen.getByRole('button', { name: 'Beğen' }).props.style).backgroundColor).toBe('#F43F5E');
  await fireEvent.press(screen.getByRole('button', { name: 'Beğen' }));
  await waitFor(() => expect(choose).toHaveBeenCalledWith(true));
  await fireEvent.press(screen.getByRole('button', { name: 'Geç' })); expect(choose).toHaveBeenCalledTimes(1);
});
test('single global tab bar retains history/back and keyboard-safe four destinations', async () => {
  await mount(<TabLayout />);
  expect(screen.getAllByTestId('global-tabs')).toHaveLength(1);
  expect(screen.getByTestId('global-tabs').props.backBehavior).toBe('history');
  expect(screen.getByTestId('global-tabs').props.screenOptions).toMatchObject({ headerShown: false, tabBarHideOnKeyboard: true });
  expect(screen.getAllByTestId('tab-route').map(row => row.props.name)).toEqual(['index', 'health', 'match', 'services']);
});
test('charcoal PatiMatch keeps light status icons in either app theme without leaking to light services', () => {
  expect(statusBarStyle('light', '/match')).toBe('light');
  expect(statusBarStyle('light', '/(tabs)/match')).toBe('light');
  expect(statusBarStyle('light', '/services')).toBe('dark');
  expect(statusBarStyle('dark', '/health')).toBe('light');
});
test('demo discovery also retains the filled red heart without emoji presentation', async () => {
  await mount(<SwipeCard candidate={matchDemo[0]} choose={jest.fn()} reduced />);
  expect(StyleSheet.flatten(screen.getByRole('button', { name: 'Beğen · demo' }).props.style).backgroundColor).toBe('#F43F5E');
  expect(screen.getByText('♥︎')).toBeTruthy();
});
test('health summary never labels unrelated medication as parasite care or expired date as next care', async () => {
  const record = { id: 'qa', owner_id: 'qa', pet_id: 'qa', created_at: '', updated_at: '', kind: 'medication' as const, title: 'Genel ilaç', occurred_on: '2000-01-01', due_on: '2000-02-01', notes: null, weight_kg: null };
  await mount(<HealthSummary records={[record]} onOpen={jest.fn()} />);
  expect(screen.queryByText('2000-01-01')).toBeNull();
  expect(screen.queryByText('2000-02-01')).toBeNull();
  expect(screen.getByText('Henüz planlanmış bakım yok.')).toBeTruthy();
});
test('undo only restores passed candidates, never cancels real/demo likes or messages', () => {
  const pet = { id: 'qa', species: 'Kedi' as const }; const candidate = matchDemo[0];
  const enabled = { qa: { ...emptyMatch(), participating: true } };
  const passed = matchReducer(enabled, { type: 'pass', pet, candidate });
  expect(matchReducer(passed, { type: 'undo', pet, candidate }).qa.excluded).toEqual([]);
  const liked = matchReducer(enabled, { type: 'like', pet, candidate });
  expect(matchReducer(liked, { type: 'undo', pet, candidate })).toBe(liked);
});
test('approved slogan is correctly spelled and deferred modules stay absent', async () => {
  await mount(<Home />); expect(screen.getByText('Daha fazla iyi insan, daha mutlu patiler.')).toBeTruthy();
  expect(screen.queryByText(/Gemini|Pixel Pet|Pati Market|Eğitim/)).toBeNull();
});
