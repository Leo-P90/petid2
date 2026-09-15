import { Text, View } from 'react-native';
import { Button, useSectionColors } from './ui';
import { PetSketch } from './pet-sketch';
import { BrandIcon, ScriptLine, fonts } from './brand';
export function MatchEmpty({ species, onDiscover, disabled = false }: { species: string; onDiscover: () => void; disabled?: boolean }) {
  const colors = useSectionColors('match');
  return <View testID="match-empty" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>
    <View style={{ width: 196, height: 144, backgroundColor: '#302A48', borderRadius: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}><PetSketch species="Kedi" size={84} color="#B7ACFF"/><PetSketch species="Köpek" size={84} color="#B7ACFF"/></View>
    <View style={{ alignItems: 'center', gap: 8 }}><BrandIcon name="sparkle" color="#B7ACFF" size={18}/><Text accessibilityRole="header" style={{ fontFamily: fonts.display, fontSize: 25, lineHeight: 32, color: colors.text, textAlign: 'center' }}>Şimdilik tüm patilerle tanıştın</Text><ScriptLine color="#CFC7EF" size={20}>Yeni bir merhaba yakında.</ScriptLine></View>
    <View style={{ width: '100%', maxWidth: 280 }}><Button label="Yeniden keşfet" disabled={disabled} onPress={onDiscover}/></View>
  </View>;
}
