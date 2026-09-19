import { createContext, useContext, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions, type TextInputProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { useApp } from '../state/app-state';
import { geometry, secondaryText } from '../core/theme';
import { PetSketch } from './pet-sketch';
import { BrandIcon, MatchWordmark, PetIDWordmark, ScriptLine, fonts } from './brand';
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
export function MatchScreen({ section, onSection, onSettings, children, unread = false }: { section: string; onSection: (section: string) => void; onSettings: () => void; children: ReactNode; unread?: boolean }) {
  const colors = useSectionColors('match');
  return <UIColors.Provider value={colors}><SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View><MatchWordmark /><ScriptLine color="#D8D2EF" size={18}>Doğru patiye, daha yakın.</ScriptLine></View><Pressable accessibilityRole="button" accessibilityLabel="PatiMatch ayarları" onPress={onSettings} style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}><BrandIcon name="filter" size={22} color="#FFFFFF"/></Pressable></View>
      <View testID="match-segments" style={{ flexDirection: 'row', height: 48, padding: 4, borderRadius: 24, backgroundColor: '#21212C', gap: 4 }}>
      {['Keşfet', 'Mesajlar'].map(label => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: label === section }} onPress={() => onSection(label)} style={{ flex: 1, minHeight: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: label === section ? '#8B7CF6' : 'transparent', flexDirection: 'row', gap: 6 }}><Text style={{ fontFamily: fonts.strong, color: label === section ? '#182033' : '#FFFFFF', fontSize: 14 }}>{label}</Text>{label === 'Mesajlar' && unread ? <View testID="match-unread-dot" style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#F43F5E' }} /> : null}</Pressable>)}
      </View>
    </View><View style={{ flex: 1, paddingHorizontal: 12, paddingBottom: 4 }}>{children}</View>
  </SafeAreaView></UIColors.Provider>;
}
function useUIColors() { const { colors } = useApp(); return useContext(UIColors) ?? colors; }
export function PetPortrait({ size = 160 }: { size?: number }) {
  const { pet } = useApp(); const colors = useUIColors(); const [failed, setFailed] = useState(false);
  return <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSoft, overflow: 'hidden' }}>{pet.photos[0] && !failed ? <Image source={{ uri: pet.photos[0] }} accessibilityLabel={pet.name + ' profil fotoğrafı'} onError={() => setFailed(true)} style={{ width: size, height: size }} /> : <View accessibilityLabel={pet.name + ' tür avatarı'}><PetSketch species={pet.species} size={Math.min(size * .8, 72)} color={colors.accent} /></View>}</View>;
}
export function HeaderActions() {
  const { pet, pets, selectPet, mode, toggleTheme, themeBusy, colors } = useApp();
  const [open, setOpen] = useState(false);
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
    <Pressable accessibilityRole="button" accessibilityLabel="Hayvan seç" accessibilityHint={`Seçili hayvan ${pet.name}`} onPress={() => setOpen(true)} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.purpleSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}><PetPortrait key={pet.id + pet.photos[0]} size={32}/><View style={{ transform: [{ rotate: '90deg' }], marginLeft: -3 }}><BrandIcon name="chevron" size={11} color={colors.text}/></View></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={mode === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'} accessibilityState={{ disabled: themeBusy }} disabled={themeBusy} onPress={() => void toggleTheme()} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><BrandIcon name={mode === 'light' ? 'moon' : 'sun'} size={22} color={colors.accent}/></Pressable>
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}><View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#11182780' }}><View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, gap: 12 }}><Label heading>Dostunu seç</Label>{pets.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.name + (item.id === pet.id ? ' · seçili' : ' profiline geç')} accessibilityState={{ selected: item.id === pet.id }} onPress={() => { selectPet(item.id); setOpen(false); }} style={{ minHeight: 56, borderRadius: 16, borderWidth: 1, borderColor: item.id === pet.id ? colors.accent : colors.border, backgroundColor: colors.background, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.purpleSoft, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>{item.photos[0] ? <Image source={{ uri: item.photos[0] }} style={{ width: 36, height: 36 }} /> : <PetSketch species={item.species} size={28} color={colors.accent}/>}</View><Text style={{ color: colors.text, fontFamily: fonts.strong, flex: 1 }}>{item.name} · {item.species}</Text></Pressable>)}<Button label="Profili yönet" secondary onPress={() => { setOpen(false); router.push('/profile'); }}/><Button label="Kapat" secondary onPress={() => setOpen(false)}/></View></View></Modal>
  </View>;
}
export function Segments({ labels, selected, onSelect, testID }: { labels: string[]; selected: string; onSelect: (label: string) => void; testID?: string }) {
  const colors = useUIColors();
  return <ScrollView testID={testID} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>{labels.map(label => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: label === selected }} onPress={() => onSelect(label)} style={{ minHeight: 48, paddingHorizontal: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: label === selected ? colors.greenSoft : colors.surface, borderWidth: 1, borderColor: colors.border }}><Text style={{ fontSize: 14, fontWeight: '600', color: label === selected ? colors.accent : colors.text }}>{label}</Text></Pressable>)}</ScrollView>;
}
export function Label({ children, heading = false }: { children: ReactNode; heading?: boolean }) {
  const colors = useUIColors();
  return <Text accessibilityRole={heading ? 'header' : undefined}
    style={{ color: colors.text, fontSize: heading ? 22 : 15, fontFamily: heading ? fonts.display : fonts.body, lineHeight: heading ? 29 : 22 }}>{children}</Text>;
}
export function Note({ children }: { children: ReactNode }) {
  const colors = useUIColors();
  return <Text accessibilityLiveRegion="polite" style={{ color: colors.muted, fontSize: 14, fontFamily: fonts.body, lineHeight: 21 }}>{children}</Text>;
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
      borderWidth: 1, borderColor: secondary ? colors.border : colors.accent, backgroundColor: secondary ? colors.surface : colors.accent,
      opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
    })}><Text style={{ color: secondary ? colors.text : colors.onAccent, fontFamily: fonts.strong, textAlign: 'center', fontSize: 16 }}>{label}</Text></Pressable>;
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
export function Screen({ title, children, tab = false, tone = 'home', headerRight, compact = false }: { title: string; children: ReactNode; tab?: boolean; tone?: Tone; headerRight?: ReactNode; compact?: boolean }) {
  const { mode, notice } = useApp();
  const colors = useSectionColors(tone); const { fontScale } = useWindowDimensions(); const insets = useSafeAreaInsets();
  const subtitle = { home: 'Daha fazla iyi insan, daha mutlu patiler.', health: 'Sev, takip et, birlikte iyi kalın.', match: 'Küçük bir merhabayla başlar', adoption: 'Bir yuva, yeni bir hayat', services: 'Onun için en iyi hizmetler, senin yanında.' }[tone];
  return <UIColors.Provider value={colors}><SafeAreaView edges={tab ? ['top', 'left', 'right'] : ['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardScreen gap={tab && tone === 'health' ? 12 : 16} bottom={tab ? 78 + insets.bottom + Math.max(0, fontScale - 1) * 32 : 32}>
      {compact ? null : tab && tone !== 'match' ? <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingBottom: 4 }}><View style={{ flexShrink: 1 }}><PetIDWordmark size={tone === 'home' ? 36 : 31} light={mode === 'dark'}/><Text style={{ color: colors.text, fontFamily: fonts.body, fontSize: 12, lineHeight: 16 }}>{subtitle}</Text></View><HeaderActions/></View> : <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><View style={{ flex: 1, gap: 3 }}><Label heading>{title}</Label><Note>{subtitle}</Note></View><HeaderActions/></View>}
      {headerRight}
      {notice ? <Note>{notice}</Note> : null}{children}
    </KeyboardScreen>
  </SafeAreaView></UIColors.Provider>;
}
export function PetSelector({ disabled = false }: { disabled?: boolean }) {
  const { pets, pet, selectPet, colors, mode } = useApp();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 2 }}>
    {pets.map((item) => { const selected = item.id === pet.id; return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.name + (selected ? ' · seçili' : ' profiline geç')} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => selectPet(item.id)}
      style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24, borderWidth: 1, borderColor: selected ? colors.green : colors.border, backgroundColor: selected ? colors.greenSoft : colors.surface }}>
      <PetSketch species={item.species} size={26} color={colors.accent} /><View><Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{item.name}</Text><Text style={{ color: secondaryText[mode], fontSize: 12 }}>{item.species} · {item.age}</Text></View>
    </Pressable>; })}
  </ScrollView>;
}
