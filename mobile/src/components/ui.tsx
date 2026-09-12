import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { useApp } from '../state/app-state';
export function Label({ children, heading = false }: { children: ReactNode; heading?: boolean }) {
  const { colors } = useApp();
  return <Text accessibilityRole={heading ? 'header' : undefined}
    style={{ color: colors.text, fontSize: heading ? 23 : 16, fontWeight: heading ? '700' : '400', lineHeight: heading ? 31 : 24 }}>{children}</Text>;
}
export function Note({ children }: { children: ReactNode }) {
  const { colors } = useApp();
  return <Text accessibilityLiveRegion="polite" style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>{children}</Text>;
}
export function Card({ children }: { children: ReactNode }) {
  const { colors } = useApp();
  return <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 18, borderRadius: 20, gap: 12 }}>{children}</View>;
}
export function Button({ label, onPress, disabled = false, secondary = false }: {
  label: string; onPress: () => void; disabled?: boolean; secondary?: boolean;
}) {
  const { colors } = useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
    disabled={disabled} onPress={onPress} style={({ pressed }) => ({
      minHeight: 48, justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14,
      borderWidth: 1, borderColor: colors.accent, backgroundColor: secondary ? colors.surface : colors.accent,
      opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
    })}><Text style={{ color: secondary ? colors.accent : colors.onAccent, fontWeight: '600', textAlign: 'center', fontSize: 16 }}>{label}</Text></Pressable>;
}
export function RouteButton({ label, href }: { label: string; href: Href }) {
  return <Button label={label} onPress={() => router.push(href)} secondary />;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { colors } = useApp();
  return <View style={{ gap: 6 }}><Label>{label}</Label><TextInput {...props} accessibilityLabel={label}
    placeholderTextColor={colors.muted} style={{ color: colors.text, backgroundColor: colors.background,
      borderColor: colors.border, borderWidth: 1, borderRadius: 12, minHeight: 48, padding: 12, fontSize: 16 }} /></View>;
}
export function Screen({ title, children, tab = false }: { title: string; children: ReactNode; tab?: boolean }) {
  const { colors, mode, toggleTheme, notice, themeBusy } = useApp();
  return <SafeAreaView edges={tab ? ['top', 'left', 'right'] : ['left', 'right', 'bottom']}
    style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: 18, paddingBottom: 32, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <View style={{ gap: 10 }}><Note>PETID · MOBİL TEMEL</Note><Label heading>{title}</Label>
          <Button secondary disabled={themeBusy} label={mode === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'} onPress={() => void toggleTheme()} />
        </View>
        {notice ? <Note>{notice}</Note> : null}
        <Note>Demo modu · Sunucu bağlı değil. Özel veriler ve iletişim paylaşılmaz. Tema dışında değişiklikler yeniden açılışta sıfırlanır.</Note>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
