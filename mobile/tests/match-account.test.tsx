import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';
import { MatchAccount } from '../src/components/match-account';
import type { MatchSnapshot, MatchProfile } from '../src/core/match-live';
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
jest.mock('../src/components/ui', () => {
  const { Text, View, Pressable, TextInput } = jest.requireActual('react-native');
  return { Screen: View, Card: View, Label: Text, Note: Text, PetSelector: () => null, useSectionColors: () => ({}),
    MatchScreen: ({ children, onSettings }: { children: React.ReactNode; onSettings: () => void }) => <View><Pressable onPress={onSettings}><Text>PatiMatch ayarları</Text></Pressable>{children}</View>,
    Button: ({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) => <Pressable disabled={disabled} onPress={onPress}><Text>{label}</Text></Pressable>,
    Field: ({ label, ...props }: { label: string }) => <TextInput accessibilityLabel={label} {...props} />, Segments: () => null };
});
jest.mock('../src/components/keyboard-screen', () => ({ KeyboardScreen: jest.requireActual('react-native').View }));
jest.mock('../src/services/supabase', () => ({ supabase: null }));
jest.mock('../src/services/native', () => ({ nativeServices: { pickPhotos: jest.fn() } }));
const profile: MatchProfile = { pet_id: 'p1', owner_id: 'a', species: 'Kedi', display_name: 'Own', active: true, birth_date: null, age_label: null, breed: '', sex: 'Belirtilmedi', bio: '', city: '', district: '' };
const candidate = { ...profile, pet_id: 'p2', owner_id: 'b', display_name: 'Other' };
const snapshot: MatchSnapshot = { profile, candidates: [candidate], threads: [], media: [] };
const pet = { id: 'p1', name: 'Own', species: 'Kedi' as const, age: '', photos: [] };
const draw = (row: { name: string }, choose: (like: boolean) => void) => <Pressable onPress={() => choose(true)}><Text>{row.name}</Text></Pressable>;
const makeRepo = () => ({ snapshot: jest.fn(async () => snapshot), photo: jest.fn(async () => null), like: jest.fn(async () => null), read: jest.fn(), send: jest.fn(), saveProfile: jest.fn(), block: jest.fn(), unmatch: jest.fn(), report: jest.fn(), upload: jest.fn(), removeMedia: jest.fn() });
test('late response from old pet cannot populate newly keyed scope', async () => {
  const old = makeRepo(); let resolve!: (value: MatchSnapshot) => void; old.snapshot.mockImplementation(() => new Promise(done => { resolve = done; }));
  const next = makeRepo(); next.snapshot.mockResolvedValue({ profile: null, candidates: [], threads: [], media: [] });
  const view = await render(<MatchAccount key="a/p1" ownerId="a" pet={pet} repo={old} renderCandidate={draw} />);
  await view.rerender(<MatchAccount key="a/p3" ownerId="a" pet={{ ...pet, id: 'p3' }} repo={next} renderCandidate={draw} />);
  await act(async () => resolve(snapshot)); await waitFor(() => expect(next.snapshot).toHaveBeenCalledWith('p3')); expect(screen.queryByText('Other')).toBeNull();
  await view.unmount();
});
test('failed like preserves candidate and retry, never creates demo conversation', async () => {
  const repo = makeRepo(); repo.like.mockRejectedValue(new Error('offline'));
  const view = await render(<MatchAccount ownerId="a" pet={pet} repo={repo} renderCandidate={draw} />);
  await waitFor(() => expect(screen.getByText('Other')).toBeTruthy()); await fireEvent.press(screen.getByText('Other'));
  await waitFor(() => expect(screen.getByText(/İşlem tamamlanamadı/)).toBeTruthy()); expect(screen.getByText('Other')).toBeTruthy();
  expect(repo.like).toHaveBeenCalledWith(profile, candidate); expect(repo.send).not.toHaveBeenCalled(); await view.unmount();
});
test('unmount cleans polling and disposes a late authenticated photo', async () => {
  const repo = makeRepo(); const dispose = jest.fn(); let resolve!: (value: { uri: string; dispose: () => void }) => void;
  repo.photo.mockImplementation(() => new Promise(done => { resolve = done; }) as never);
  const clear = jest.spyOn(globalThis, 'clearInterval'); const view = await render(<MatchAccount ownerId="a" pet={pet} repo={repo} renderCandidate={draw} />);
  await waitFor(() => expect(repo.photo).toHaveBeenCalled()); await view.unmount(); await act(async () => resolve({ uri: 'private-photo', dispose }));
  expect(dispose).toHaveBeenCalled(); expect(clear).toHaveBeenCalled(); clear.mockRestore();
});
