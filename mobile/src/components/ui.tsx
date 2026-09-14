import { createContext, useContext, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions, type TextInputProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { useApp } from '../state/app-state';
import { geometry, secondaryText } from '../core/theme';
import { KeyboardScreen, useKeyboardFocus } from './keyboard-screen';
type Tone = 'home' | 'health' | 'match' | 'adoption' | 'services';
type Colors = ReturnType<typeof useApp>['colors'];
const UIColors = createContext<Colors | null>(null);
export function useSectionColors(tone: Tone = 'home'): Colors {
  const { colors } = useApp();
  if (tone === 'match') return { ...colors, background: '#101116', surface: '#1C1D26', text: '#FFFFFF', muted: '#B9BAC8', border: '#343541', accent: '#B7ACFF', onAccent: '#182033', greenSoft: '#302A48', greenMid: '#514969' };
  return colors;
}
export function Paw({ size = 28, color = '#8B7CF6' }: { size?: number; color?: string }) {
  return <View accessible={false} style={{ width: size, height: size, transform: [{ rotate: '-12deg' }] }}><View style={{ position: 'absolute', bottom: 1, left: size * .22, width: size * .56, height: size * .48, borderRadius: size, backgroundColor: color }} />{[0, 1, 2, 3].map(i => <View key={i} style={{ position: 'absolute', left: i * size * .24, top: i === 0 || i === 3 ? size * .22 : 0, width: size * .2, height: size * .28, borderRadius: size, backgroundColor: color }} />)}</View>;
}
export function MatchScreen({ section, onSection, onSettings, children }: { section: string; onSection: (section: string) => void; onSettings: () => void; children: ReactNode }) {
  const colors = useSectionColors('match');
  return <UIColors.Provider value={colors}><SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}><View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 12 }}><Paw size={24} /><View style={{ maxWidth: 200, flexShrink: 1 }}><Segments labels={['Keşfet', 'Mesajlar']} selected={section} onSelect={onSection} /></View><Pressable accessibilityRole="button" accessibilityLabel="PatiMatch ayarları" onPress={onSettings} style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: colors.text, fontSize: 24 }}>⚙</Text></Pressable></View><View style={{ flex: 1, paddingHorizontal: 12, paddingBottom: 6, gap: 8 }}>{children}</View></SafeAreaView></UIColors.Provider>;
}
function useUIColors() { const { colors } = useApp(); return useContext(UIColors) ?? colors; }
export function PetPortrait({ size = 160 }: { size?: number }) {
  const { pet } = useApp(); const colors = useUIColors(); const [failed, setFailed] = useState(false);
  return <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSoft, overflow: 'hidden' }}>{pet.photos[0] && !failed ? <Image source={{ uri: pet.photos[0] }} accessibilityLabel={pet.name + ' profil fotoğrafı'} onError={() => setFailed(true)} style={{ width: size, height: size }} /> : <View accessibilityLabel={pet.name + ' tür avatarı'}><Paw size={size * .52} color={colors.accent} /></View>}</View>;
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
  const subtitle = { home: 'Daha fazla iyi insan, daha mutlu patiler.', health: 'Küçük bakımlar, güzel günler.', match: 'Küçük bir merhabayla başlar', adoption: 'Bir yuva, yeni bir hayat', services: 'Patin için güzel yerler.' }[tone];
  return <UIColors.Provider value={colors}><SafeAreaView edges={tab ? ['top', 'left', 'right'] : ['left', 'right', 'bottom']}
    style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardScreen bottom={tab ? 96 + insets.bottom + Math.max(0, fontScale - 1) * 32 : 32}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><View style={{ flex: 1, gap: 3 }}><Label heading>{title}</Label><Note>{subtitle}</Note></View><PetPortrait key={pet.id + pet.photos[0]} size={32} />
          <Pressable accessibilityRole="button" accessibilityLabel={mode === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'} accessibilityState={{ disabled: themeBusy }} disabled={themeBusy} onPress={() => void toggleTheme()}
            style={{ minHeight: 48, minWidth: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.greenSoft, borderColor: colors.greenMid, borderWidth: 1, borderRadius: 24 }}><Text accessible={false} style={{ fontSize: 22, color: colors.accent }}>{mode === 'light' ? '☾' : '☀'}</Text></Pressable>
        </View>
        {notice ? <Note>{notice}</Note> : null}
        {children}
    </KeyboardScreen>
  </SafeAreaView></UIColors.Provider>;
}
export function PetSelector({ disabled = false }: { disabled?: boolean }) {
  const { pets, pet, selectPet, colors, mode } = useApp();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 2 }}>
    {pets.map((item) => { const selected = item.id === pet.id; return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.name + (selected ? ' · seçili' : ' profiline geç')} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => selectPet(item.id)}
      style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24, borderWidth: 1, borderColor: selected ? colors.green : colors.border, backgroundColor: selected ? colors.greenSoft : colors.surface }}>
      <Paw size={22} color={colors.accent} /><View><Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{item.name}</Text><Text style={{ color: secondaryText[mode], fontSize: 12 }}>{item.species} · {item.age}</Text></View>
    </Pressable>; })}
  </ScrollView>;
}
