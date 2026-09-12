import { act, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '../src/state/auth-state';
import { AppProvider, useApp } from '../src/state/app-state';
import { createAuthAdapter } from '../src/services/auth';
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-linking', () => ({ createURL: () => 'petid://reset-password', parse: (url: string) => ({ path: url.includes('reset-password') ? 'reset-password' : '', queryParams: {} }), getInitialURL: async () => null, addEventListener: () => ({ remove: jest.fn() }) }));

const session = { user: { id: '11111111-1111-4111-8111-111111111111', email: 'owner@example.test' } } as never;
const adapter = {
  configured: true, session: jest.fn(async () => session), listen: jest.fn(() => () => undefined),
  signIn: jest.fn(async () => undefined), signUp: jest.fn(async () => undefined), signOut: jest.fn(async () => undefined),
  recover: jest.fn(async () => undefined), exchangeRecoveryUrl: jest.fn(async () => undefined), updatePassword: jest.fn(async () => undefined),
};
const emptyRepository = {
  configured: true, list: jest.fn(async () => []), create: jest.fn(), update: jest.fn(), remove: jest.fn(), uploadPhoto: jest.fn(), removePhoto: jest.fn(),
};
function Probe() { const auth = useAuth(); const app = useApp(); return <Text>{auth.status}:{app.pets.map((pet) => pet.name).join(',') || 'empty'}</Text>; }

test('unconfigured adapter is explicit and safe', async () => {
  expect(createAuthAdapter(null).configured).toBe(false);
  await expect(createAuthAdapter(null).session()).resolves.toBeNull();
});

test('restored authenticated account starts empty without demo pet leakage', async () => {
  await act(async () => {
    render(<AuthProvider adapter={adapter}><AppProvider petRepository={emptyRepository as never}><Probe /></AppProvider></AuthProvider>);
    await Promise.resolve(); await Promise.resolve();
  });
  await waitFor(() => expect(screen.getByText('signedIn:empty')).toBeTruthy());
  expect(screen.queryByText(/Mia|Atlas/)).toBeNull();
});
