import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Screen, Label, Note, PetSelector, PetPortrait, Button, useSectionColors } from '../../components/ui';
import { useApp } from '../../state/app-state';
export default function Home() {
  const { pet } = useApp(); const colors = useSectionColors();
  const actions: { title: string; label: string; icon: string; href: Href }[] = [
    { title: 'Dostum', label: 'Profili ve dijital kimliği aç', icon: '⌁', href: '/profile' },
    { title: 'Tanış', label: 'PatiMatch keşfi', icon: '♡', href: '/match' },
    { title: 'Yuva ol', label: 'Sahiplendirme ilanları', icon: '⌂', href: '/adoption' },
  ];
  return <Screen title="PetID" tab><PetSelector />
    <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center', paddingVertical: 12 }}><PetPortrait key={pet.id + pet.photos[0]} size={80} /><View style={{ flex: 1, gap: 5 }}><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 27, fontWeight: '800' }}>{pet.name}</Text><Note>{pet.species} · {pet.age}</Note>{!pet.photos.length ? <Pressable accessibilityRole="button" accessibilityLabel="Fotoğraf ekle" onPress={() => router.push('/profile')} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={{ color: colors.greenDark, fontWeight: '600', fontSize: 14 }}>Fotoğraf ekle ↗</Text></Pressable> : null}</View></View>
    <View style={{ padding: 22, gap: 16, borderRadius: 26, backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: colors.green }}><Text style={{ color: colors.greenDark, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 }}>BİRAZ ÖZEN, ÇOKÇA SEVGİ</Text><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, lineHeight: 33, fontWeight: '700' }}>{pet.name} için güzel bir gün.</Text><Note>Bakım notları, küçük hatırlatmalar ve birlikte iyi hissettiren her şey.</Note><Button label="Sağlık geçmişi" secondary onPress={() => router.push('/health')} /></View>
    <View style={{ paddingTop: 8, gap: 12 }}><Label heading>Birlikte daha güzel</Label><View style={{ flexDirection: 'row', gap: 10 }}>{actions.map(item => <Pressable key={item.title} accessibilityRole="button" accessibilityLabel={item.label} onPress={() => router.push(item.href)} style={{ flex: 1, minHeight: 96, alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 20, backgroundColor: item.href === '/match' ? colors.purpleSoft : colors.surface }}><Text style={{ fontSize: 28, color: colors.accent }}>{item.icon}</Text><Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{item.title}</Text></Pressable>)}</View></View>
  </Screen>;
}
