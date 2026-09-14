import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { HealthAccount } from '../src/components/health-account';
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
jest.mock('../src/components/ui', () => {
  const { Text, View, Pressable, TextInput } = jest.requireActual('react-native');
  return { Card: View, Label: Text, Note: Text,
    Button: ({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) => <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}><Text>{label}</Text></Pressable>,
    Field: ({ label, ...props }: { label: string }) => <TextInput accessibilityLabel={label} {...props} />,
    Segments: () => null };
});
jest.mock('../src/services/supabase', () => ({ supabase: null }));
jest.mock('../src/services/native', () => ({ nativeServices: { pickFile: jest.fn() } }));
const makeRepo = () => ({ records: jest.fn(async () => []), documents: jest.fn(async () => []), save: jest.fn(async () => undefined), remove: jest.fn(), upload: jest.fn(), signedUrl: jest.fn(), removeDocument: jest.fn() });
test('save failure remains visible without success and preserves form', async () => {
  const repo = makeRepo(); repo.save.mockRejectedValue(new Error('write denied'));
  await render(<HealthAccount ownerId="a" petId="p" tab="Aşılar" repo={repo} />);
  await waitFor(() => expect(screen.getByText('Bu hayvan için henüz kayıt yok.')).toBeTruthy());
  await fireEvent.press(screen.getByText('Sağlık kaydı ekle'));
  await fireEvent.changeText(screen.getByLabelText('Başlık'), 'Aşı');
  await fireEvent.changeText(screen.getByLabelText('Kayıt tarihi (YYYY-AA-GG)'), '2026-09-14');
  await fireEvent.press(screen.getByText('Kaydı kaydet'));
  await waitFor(() => expect(screen.getByText('write denied')).toBeTruthy());
  expect(screen.queryByText('Kayıt kaydedildi.')).toBeNull();
  expect(screen.getByLabelText('Başlık').props.value).toBe('Aşı');
  expect(repo.save).toHaveBeenCalledWith('a', 'p', expect.objectContaining({ title: 'Aşı', kind: 'vaccine' }), undefined);
});
test('late previous pet response cannot populate newly keyed pet', async () => {
  let resolve!: (value: never[]) => void;
  const oldRepo = makeRepo(); oldRepo.records.mockImplementation(() => new Promise((done) => { resolve = done; }));
  const newRepo = makeRepo();
  const view = await render(<HealthAccount key="a/p1" ownerId="a" petId="p1" tab="Geçmiş" repo={oldRepo} />);
  await view.rerender(<HealthAccount key="a/p2" ownerId="a" petId="p2" tab="Geçmiş" repo={newRepo} />);
  await act(async () => resolve([{ id: 'old', title: 'Private old record', kind: 'exam', occurred_on: '2026-09-14', weight_kg: null }] as never[]));
  await waitFor(() => expect(screen.getByText('Bu hayvan için henüz kayıt yok.')).toBeTruthy());
  expect(screen.queryByText('Private old record')).toBeNull();
});

