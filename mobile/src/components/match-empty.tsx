import { Text, View } from 'react-native';
import { Button, useSectionColors } from './ui';
import { PetSketch } from './pet-sketch';
export function MatchEmpty({ species, onDiscover, disabled = false }: { species: string; onDiscover: () => void; disabled?: boolean }) {
  const colors = useSectionColors('match');
  return <View testID="match-empty" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 24 }}><View style={{ backgroundColor: colors.greenSoft, padding: 24, borderRadius: 48 }}><PetSketch species={species} size={96} color={colors.accent} /></View><Text accessibilityRole="header" style={{ fontSize: 26, lineHeight: 34, fontWeight: '700', color: colors.text, textAlign: 'center' }}>Şimdilik tüm patilerle tanıştın</Text><View style={{ width: '100%', maxWidth: 280 }}><Button label="Yeniden keşfet" disabled={disabled} onPress={onDiscover} /></View></View>;
}
