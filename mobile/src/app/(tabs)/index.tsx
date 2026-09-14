import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Screen, Label, Note, PetSelector, PetPortrait, RouteButton, Card, useSectionColors } from '../../components/ui';
import { useApp } from '../../state/app-state';
export default function Home() {
  const { pet } = useApp(); const colors = useSectionColors();
  const shortcuts: { title: string; label: string; icon: string; href: Href }[] = [
    { title: 'Dostum', label: 'Profili ve dijital kimliği aç', icon: '🐾', href: '/profile' },
    { title: 'Sağlık', label: 'Sağlık geçmişi', icon: '＋', href: '/health' },
    { title: 'Yuva ol', label: 'Sahiplendirme ilanları', icon: '⌂', href: '/adoption' },
  ];
  return <Screen title="PetID" tab><PetSelector />
    <View style={{ alignItems: 'center', gap: 8, paddingVertical: 10 }}><PetPortrait key={pet.id + pet.photos[0]} size={176} /><Note>{pet.name} · {pet.age}</Note><Text style={{ color: colors.accent, fontSize: 11, letterSpacing: 1.4, fontWeight: '700' }}>İYİ Kİ HAYATIMIZDALAR</Text><Text accessibilityRole="header" style={{ textAlign: 'center', color: colors.text, fontSize: 28, lineHeight: 33, fontWeight: '800' }}>Küçük patiler.{'\n'}Kocaman bir dünya.</Text><Note>{pet.name} için iyi hissettiren her şey burada.</Note></View>
    <View style={{ flexDirection: 'row', gap: 8 }}>{shortcuts.map(item => <Pressable key={item.title} accessibilityRole="button" accessibilityLabel={item.label} onPress={() => router.push(item.href)} style={{ flex: 1, minHeight: 88, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, borderRadius: 18, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}><Text style={{ fontSize: 25, color: colors.accent }}>{item.icon}</Text><Label>{item.title}</Label></Pressable>)}</View>
    <Label heading>Yaklaşan bakım</Label><Card><Label>Bakım defteri seni bekliyor</Label><Note>Küçük bir bakım, güzel bir gün.</Note><RouteButton label="Bakım defterini aç" href="/health" /></Card>
    <Label heading>Birlikte daha güzel</Label><Pressable accessibilityRole="button" accessibilityLabel="PatiMatch keşfi" onPress={() => router.push('/match')} style={{ backgroundColor: colors.purpleSoft, padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 96 }}><Text style={{ fontSize: 34, color: colors.accent }}>♡</Text><View style={{ flex: 1 }}><Label>Yeni bir patiyle tanış</Label><Note>{pet.species} arkadaşlarla bir merhaba.</Note></View><Text style={{ color: colors.text }}>→</Text></Pressable>
    <RouteButton label="Kayıp veya yaralı hayvan" href="/reports" /><RouteButton label="Acil veteriner" href="/emergency" />
  </Screen>;
}
