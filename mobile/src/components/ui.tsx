import { useRef, type ReactNode, type RefObject } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, useWindowDimensions, type TextInputProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { useApp } from '../state/app-state';
import { geometry, secondaryText } from '../core/theme';
import { KeyboardScreen, useKeyboardFocus } from './keyboard-screen';
export function Label({ children, heading = false }: { children: ReactNode; heading?: boolean }) {
  const { colors } = useApp();
  return <Text accessibilityRole={heading ? 'header' : undefined}
    style={{ color: colors.text, fontSize: heading ? 20 : 15, fontWeight: heading ? '700' : '500', lineHeight: heading ? 28 : 22 }}>{children}</Text>;
}
export function Note({ children }: { children: ReactNode }) {
  const { mode } = useApp();
  return <Text accessibilityLiveRegion="polite" style={{ color: secondaryText[mode], fontSize: 14, lineHeight: 21 }}>{children}</Text>;
}
export function Card({ children, focusArea }: { children: ReactNode; focusArea?: RefObject<View | null> }) {
  const { colors } = useApp();
  return <View ref={focusArea} style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 16, borderRadius: geometry.radius, gap: 12, boxShadow: [{ offsetX: 0, offsetY: 4, blurRadius: 18, color: colors.shadow + '0F' }] }}>{children}</View>;
}
export function Button({ label, onPress, disabled = false, secondary = false }: {
  label: string; onPress: () => void; disabled?: boolean; secondary?: boolean;
}) {
  const { colors } = useApp();
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
  const { colors, mode } = useApp();
  const area = useRef<View>(null);
  const focus = useKeyboardFocus();
  return <View ref={area} style={{ gap: 6 }}><Label>{label}</Label><TextInput {...props} accessibilityLabel={label}
    onFocus={(event) => { focus(focusArea ?? area); onFocus?.(event); }} onBlur={(event) => { focus(null); onBlur?.(event); }}
    placeholderTextColor={secondaryText[mode]} style={{ color: colors.text, backgroundColor: colors.background,
      borderColor: colors.border, borderWidth: 1, borderRadius: 12, minHeight: 48, padding: 12, fontSize: 16 }} /></View>;
}
export function Screen({ title, children, tab = false }: { title: string; children: ReactNode; tab?: boolean }) {
  const { colors, mode, toggleTheme, notice, themeBusy } = useApp();
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return <SafeAreaView edges={tab ? ['top', 'left', 'right'] : ['left', 'right', 'bottom']}
    style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardScreen bottom={tab ? 96 + insets.bottom + Math.max(0, fontScale - 1) * 32 : 32}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><View style={{ flex: 1, gap: 3 }}><Label heading>{title}</Label><Note>PetID · Dostun için, her gün</Note></View>
          <Pressable accessibilityRole="button" accessibilityLabel={mode === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'} accessibilityState={{ disabled: themeBusy }} disabled={themeBusy} onPress={() => void toggleTheme()}
            style={{ minHeight: 48, minWidth: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.greenSoft, borderColor: colors.greenMid, borderWidth: 1, borderRadius: 24 }}><Text accessible={false} style={{ fontSize: 22, color: colors.accent }}>{mode === 'light' ? '☾' : '☀'}</Text></Pressable>
        </View>
        {notice ? <Note>{notice}</Note> : null}
        {children}
        <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 12 }}><Note>Demo · Sunucu bağlı değil. Tema dışındaki değişiklikler oturum sonunda sıfırlanır; veri paylaşılmaz.</Note></View>
    </KeyboardScreen>
  </SafeAreaView>;
}
export function PetSelector({ disabled = false }: { disabled?: boolean }) {
  const { pets, pet, selectPet, colors, mode } = useApp();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 2 }}>
    {pets.map((item) => { const selected = item.id === pet.id; return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.name + (selected ? ' · seçili' : ' profiline geç')} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => selectPet(item.id)}
      style={{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1.5, borderColor: selected ? colors.green : colors.border, backgroundColor: selected ? colors.greenSoft : colors.surface }}>
      <Text accessible={false} style={{ fontSize: 26 }}>{item.species === 'Kedi' ? '🐱' : '🐶'}</Text><View><Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{item.name}</Text><Text style={{ color: secondaryText[mode], fontSize: 12 }}>{item.species} · {item.age}</Text></View>
    </Pressable>; })}
  </ScrollView>;
}
