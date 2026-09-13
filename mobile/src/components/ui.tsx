import { createContext, useContext, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions, type TextInputProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { useApp } from '../state/app-state';
import { geometry, secondaryText } from '../core/theme';
import { KeyboardScreen, useKeyboardFocus } from './keyboard-screen';
import { useAuth } from '../state/auth-state';
type Tone = 'home' | 'health' | 'match' | 'adoption' | 'services';
type Colors = ReturnType<typeof useApp>['colors'];
const UIColors = createContext<Colors | null>(null);
export function useSectionColors(tone: Tone = 'home'): Colors {
  const { colors, mode } = useApp();
  const dark = mode === 'dark';
  const base = dark ? { background: '#13231E', surface: '#1E3029', text: '#F0F5F1', muted: '#ACBDB3', border: '#35463E', accent: '#80D4AE', onAccent: '#13231E' } : { background: '#F5F9F6', surface: '#FFFFFF', text: '#18352D', muted: '#64766E', border: '#E1EAE4', accent: '#087B59', onAccent: '#FFFFFF' };
  const section = tone === 'health' ? (dark ? { background: '#17232E', surface: '#213240', accent: '#8AC6FC', greenSoft: '#2C465F' } : { background: '#F3F8FD', accent: '#236DA9', greenSoft: '#E4EFFB' }) : tone === 'match' ? (dark ? { background: '#251D24', surface: '#332631', accent: '#FF9BBF', greenSoft: '#4B2E3E' } : { background: '#FFF7FA', accent: '#C73068', greenSoft: '#FCE6EE' }) : tone === 'adoption' || tone === 'services' ? (dark ? { background: '#29241D', surface: '#383027', accent: '#EFBB86', greenSoft: '#504132' } : { background: '#FFFAF3', accent: '#A55B29', greenSoft: '#F8EBD9' }) : { greenSoft: dark ? '#28493A' : '#E2F2E9' };
  return { ...colors, ...base, ...section };
}
function useUIColors() { const { colors } = useApp(); return useContext(UIColors) ?? colors; }
export function PetPortrait({ size = 160 }: { size?: number }) {
  const { pet } = useApp(); const colors = useUIColors(); const [failed, setFailed] = useState(false);
  return <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSoft, overflow: 'hidden' }}>{pet.photos[0] && !failed ? <Image source={{ uri: pet.photos[0] }} accessibilityLabel={pet.name + ' profil fotoğrafı'} onError={() => setFailed(true)} style={{ width: size, height: size }} /> : <Text accessibilityLabel={pet.name + ' tür avatarı'} style={{ fontSize: size * .62 }}>{pet.species === 'Kedi' ? '🐱' : '🐶'}</Text>}</View>;
}
export function Segments({ labels, selected, onSelect }: { labels: string[]; selected: string; onSelect: (label: string) => void }) {
  const colors = useUIColors();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>{labels.map(label => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: label === selected }} onPress={() => onSelect(label)} style={{ minHeight: 48, paddingHorizontal: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: label === selected ? colors.greenSoft : colors.surface, borderWidth: 1, borderColor: colors.border }}><Text style={{ fontSize: 14, fontWeight: '600', color: label === selected ? colors.accent : colors.text }}>{label}</Text></Pressable>)}</ScrollView>;
}
export function Label({ children, heading = false }: { children: ReactNode; heading?: boolean }) {
  const colors = useUIColors();
  return <Text accessibilityRole={heading ? 'header' : undefined}
    style={{ color: colors.text, fontSize: heading ? 20 : 15, fontWeight: heading ? '700' : '500', lineHeight: heading ? 28 : 22 }}>{children}</Text>;
}
export function Note({ children }: { children: ReactNode }) {
  const colors = useUIColors();
  return <Text accessibilityLiveRegion="polite" style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>{children}</Text>;
}
export function Card({ children, focusArea, radius = 22 }: { children: ReactNode; focusArea?: RefObject<View | null>; radius?: number }) {
  const colors = useUIColors();
  return <View ref={focusArea} style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 18, borderRadius: radius, gap: 12, boxShadow: [{ offsetX: 0, offsetY: 4, blurRadius: 18, color: colors.shadow + '0F' }] }}>{children}</View>;
}
export function Button({ label, onPress, disabled = false, secondary = false }: {
  label: string; onPress: () => void; disabled?: boolean; secondary?: boolean;
}) {
  const colors = useUIColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
    disabled={disabled} onPress={onPress} style={({ pressed }) => ({
      minHeight: geometry.touch, justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: geometry.buttonRadius,
      borderWidth: 1, borderColor: colors.accent, backgroundColor: secondary ? colors.surface : colors.accent,
      opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
    })}><Text style={{ color: secondary ? colors.accent : colors.onAccent, fontWeight: '600', textAlign: 'center', fontSize: 16 }}>{label}</Text></Pressable>;
}
export function RouteButton({ label, href }: { label: string; href: Href }) {
  return <Button label={label} onPress={() => router.push(href)} secondary />;
}
export function Field({ label, focusArea, onFocus, onBlur, ...props }: TextInputProps & { label: string; focusArea?: RefObject<View | null> }) {
  const { mode } = useApp(); const colors = useUIColors();
  const area = useRef<View>(null);
  const focus = useKeyboardFocus();
  return <View ref={area} style={{ gap: 6 }}><Label>{label}</Label><TextInput {...props} accessibilityLabel={label}
    onFocus={(event) => { focus(focusArea ?? area); onFocus?.(event); }} onBlur={(event) => { focus(null); onBlur?.(event); }}
    placeholderTextColor={secondaryText[mode]} style={{ color: colors.text, backgroundColor: colors.background,
      borderColor: colors.border, borderWidth: 1, borderRadius: 12, minHeight: 48, padding: 12, fontSize: 16 }} /></View>;
}
export function Screen({ title, children, tab = false, tone = 'home' }: { title: string; children: ReactNode; tab?: boolean; tone?: Tone }) {
  const { pet, mode, toggleTheme, notice, themeBusy } = useApp();
  const colors = useSectionColors(tone);
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const subtitle = { home: 'Can dostunun dijital dünyası', health: 'Bakım defteri', match: 'Küçük bir merhabayla başlar', adoption: 'Bir yuva, yeni bir hayat', services: 'Yakınında ol, yanında ol' }[tone];
  return <UIColors.Provider value={colors}><SafeAreaView edges={tab ? ['top', 'left', 'right'] : ['left', 'right', 'bottom']}
    style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardScreen bottom={tab ? 96 + insets.bottom + Math.max(0, fontScale - 1) * 32 : 32}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><View style={{ flex: 1, gap: 3 }}><Label heading>{title}</Label><Note>{subtitle}</Note></View><PetPortrait key={pet.id + pet.photos[0]} size={32} />
          <Pressable accessibilityRole="button" accessibilityLabel={mode === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'} accessibilityState={{ disabled: themeBusy }} disabled={themeBusy} onPress={() => void toggleTheme()}
            style={{ minHeight: 48, minWidth: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.greenSoft, borderColor: colors.greenMid, borderWidth: 1, borderRadius: 24 }}><Text accessible={false} style={{ fontSize: 22, color: colors.accent }}>{mode === 'light' ? '☾' : '☀'}</Text></Pressable>
        </View>
        {notice ? <Note>{notice}</Note> : null}
        {children}
        <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 12 }}><Note>{auth.status === 'signedIn' && !auth.demo ? 'Hesap modu · Profilleriniz özel ve kalıcıdır.' : 'Demo · Hesap verileriyle karışmaz; tema dışındaki değişiklikler oturum sonunda sıfırlanır.'}</Note></View>
    </KeyboardScreen>
  </SafeAreaView></UIColors.Provider>;
}
export function PetSelector({ disabled = false }: { disabled?: boolean }) {
  const { pets, pet, selectPet, colors, mode } = useApp();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 2 }}>
    {pets.map((item) => { const selected = item.id === pet.id; return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.name + (selected ? ' · seçili' : ' profiline geç')} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => selectPet(item.id)}
      style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24, borderWidth: 1, borderColor: selected ? colors.green : colors.border, backgroundColor: selected ? colors.greenSoft : colors.surface }}>
      <Text accessible={false} style={{ fontSize: 26 }}>{item.species === 'Kedi' ? '🐱' : '🐶'}</Text><View><Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{item.name}</Text><Text style={{ color: secondaryText[mode], fontSize: 12 }}>{item.species} · {item.age}</Text></View>
    </Pressable>; })}
  </ScrollView>;
}
