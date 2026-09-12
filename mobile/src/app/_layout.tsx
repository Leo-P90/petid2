import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import { AppProvider, useApp } from '../state/app-state';
export const unstable_settings = { initialRouteName: '(tabs)' };
function Navigation() {
  const { colors, mode, ready } = useApp();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: colors.text }}>PetID hazırlanıyor…</Text></View>;
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  return <ThemeProvider value={{ ...base, colors: { ...base.colors, background: colors.background, card: colors.surface, text: colors.text, primary: colors.accent, border: colors.border } }}>
    <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerTintColor: colors.text, headerStyle: { backgroundColor: colors.surface }, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" options={{ title: 'PetID', headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: 'Hayvan profili' }} />
      <Stack.Screen name="reports" options={{ title: 'Kayıp / yaralı' }} />
      <Stack.Screen name="emergency" options={{ title: 'Acil veteriner' }} />
      <Stack.Screen name="adoption/index" options={{ title: 'Sahiplendirme' }} />
      <Stack.Screen name="adoption/[id]" options={{ title: 'İlan detayı' }} />
    </Stack>
  </ThemeProvider>;
}
export default function Layout() {
  return <SafeAreaProvider><AppProvider><Navigation /></AppProvider></SafeAreaProvider>;
}
