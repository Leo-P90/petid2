import { Stack, ThemeProvider, DarkTheme, DefaultTheme, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useFonts } from 'expo-font';
import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import { Text, View } from 'react-native';
import { AppProvider, useApp } from '../state/app-state';
import { AuthProvider, useAuth } from '../state/auth-state';
import { Button, Card, Field, Note, Screen } from '../components/ui';
import { statusBarStyle } from '../core/theme';
export const unstable_settings = { initialRouteName: '(tabs)' };
function Navigation() {
  const pathname = usePathname();
  const { colors, mode, ready, pets, petsBusy, petNotice, createPet } = useApp();
  const auth = useAuth();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: colors.text }}>PetID hazırlanıyor…</Text></View>;
  if (!auth.demo && (auth.status === 'loading')) return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: colors.text }}>Oturum geri yükleniyor…</Text></View>;
  if (!auth.demo && auth.status !== 'signedIn') return <AuthGate />;
  if (!auth.demo && (petsBusy || pets.length === 0)) return <EmptyPets busy={petsBusy} notice={petNotice} createPet={createPet} />;
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  return <ThemeProvider value={{ ...base, colors: { ...base.colors, background: colors.background, card: colors.surface, text: colors.text, primary: colors.accent, border: colors.border } }}>
    <StatusBar style={statusBarStyle(mode, pathname)} />
    <Stack screenOptions={{ headerTintColor: colors.text, headerStyle: { backgroundColor: colors.surface }, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" options={{ title: 'PetID', headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: 'Hayvan profili' }} />
      <Stack.Screen name="reports" options={{ title: 'Pati bildirimi oluştur' }} />
      <Stack.Screen name="emergency" options={{ title: 'Acil veteriner' }} />
      <Stack.Screen name="adoption/index" options={{ title: 'Sahiplendirme' }} />
      <Stack.Screen name="adoption/[id]" options={{ title: 'İlan detayı' }} />
      <Stack.Screen name="account" options={{ title: 'Hesap' }} />
      <Stack.Screen name="reset-password" options={{ title: 'Yeni parola' }} />
    </Stack>
  </ThemeProvider>;
}
export default function Layout() {
  const [loaded, error] = useFonts({ Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold, Caveat_600SemiBold });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: '#FFF9F2', justifyContent: 'center', alignItems: 'center' }}><Text>PetID hazırlanıyor…</Text></View>;
  return <SafeAreaProvider><AuthProvider><AppProvider><Navigation /></AppProvider></AuthProvider></SafeAreaProvider>;
}

function AuthGate() {
  const auth = useAuth(); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const configured = auth.status !== 'unconfigured';
  return <Screen title="PetID hesabı"><Card><Note>{configured ? 'Profil ve özel fotoğraflarınıza güvenli biçimde erişin.' : 'Supabase sunucusu yapılandırılmadı. Hesap işlemleri kapalı; demo güvenle kullanılabilir.'}</Note>
    <Field label="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
    <Field label="Parola" value={password} onChangeText={setPassword} secureTextEntry />
    <Button label="Giriş yap" disabled={!configured || auth.busy || !email || !password} onPress={() => void auth.signIn(email, password)} />
    <Button secondary label="Hesap oluştur" disabled={!configured || auth.busy || !email || password.length < 8} onPress={() => void auth.signUp(email, password)} />
    <Button secondary label="Parolamı unuttum" disabled={!configured || auth.busy || !email} onPress={() => void auth.recover(email)} />
    <Button secondary label="Demo moduna dön" disabled={auth.busy} onPress={auth.useDemo} />
    {auth.message ? <Note>{auth.message}</Note> : null}</Card></Screen>;
}
function EmptyPets({ busy, notice, createPet }: { busy: boolean; notice: string; createPet: (input: { name: string; species: 'Kedi' | 'Köpek'; age: string }) => Promise<void> }) {
  const auth = useAuth(); const [name, setName] = useState(''); const [age, setAge] = useState(''); const [species, setSpecies] = useState<'Kedi' | 'Köpek'>('Kedi');
  return <Screen title="İlk hayvan profiliniz"><Card><Note>Bu hesapta henüz hayvan profili yok. Demo hayvanları hesap verilerine karıştırılmaz.</Note>
    <Field label="Hayvanın adı" value={name} onChangeText={setName} />
    <Field label="Yaşı" value={age} onChangeText={setAge} />
    <Button secondary label={`Tür: ${species}`} onPress={() => setSpecies(species === 'Kedi' ? 'Köpek' : 'Kedi')} />
    <Button label="Hayvan profili ekle" disabled={busy || !name.trim() || !age.trim()} onPress={() => void createPet({ name, age, species })} />
    <Button secondary label="Çıkış yap" disabled={busy} onPress={() => void auth.signOut()} />{notice ? <Note>{notice}</Note> : null}</Card></Screen>;
}
