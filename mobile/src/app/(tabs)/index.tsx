import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Screen, Label, Note, PetSelector, RouteButton } from '../../components/ui';
import { useApp } from '../../state/app-state';
import { geometry } from '../../core/theme';
const modules: { label: string; description: string; icon: string; tone: 'blue' | 'red' | 'purple' | 'amber'; href: Href }[] = [
  { label: 'Sağlık geçmişi', description: 'Aşı, ilaç ve belgeler', icon: '✚', tone: 'blue', href: '/health' },
  { label: 'Kayıp veya yaralı hayvan', description: 'Bir dosta yardım et', icon: '⌖', tone: 'red', href: '/reports' },
  { label: 'PatiMatch keşfi', description: 'Yeni bir pati arkadaşı', icon: '♡', tone: 'purple', href: '/match' },
  { label: 'Sahiplendirme ilanları', description: 'Bir yuva, yeni bir hayat', icon: '⌂', tone: 'amber', href: '/adoption' },
];
export default function Home() {
  const { pet, colors } = useApp();
  return <Screen title="Dostunun dünyası, bir arada" tab>
    <PetSelector />
    <RouteButton label="Hesap ve oturum" href="/account" />
    <Pressable accessibilityRole="button" accessibilityLabel="Profili ve dijital kimliği aç" onPress={() => router.push('/profile')}
      style={{ backgroundColor: colors.greenDark, borderRadius: geometry.radius, padding: 20, overflow: 'hidden', minHeight: 190, gap: 8 }}>
      <View accessible={false} style={{ position: 'absolute', right: -60, bottom: -45, width: 150, height: 150, borderRadius: 75, backgroundColor: colors.green }} />
      <Text accessible={false} style={{ position: 'absolute', right: 8, bottom: 2, fontSize: 46, opacity: 0.14 }}>🐾</Text>
      <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>BİRLİKTE DAHA GÜZEL</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ flex: 1, gap: 8 }}>
        <Text accessibilityRole="header" style={{ color: colors.white, fontSize: 24, lineHeight: 32, fontWeight: '800' }}>Merhaba, {pet.name}!</Text>
        <Text style={{ color: colors.white, fontSize: 14, lineHeight: 21 }}>Küçük patiler, büyük dostluklar.</Text>
        <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700', marginTop: 8 }}>Profili ve dijital kimliği aç →</Text>
      </View><Text accessible={false} style={{ fontSize: 68 }}>{pet.species === 'Kedi' ? '🐱' : '🐶'}</Text></View>
    </Pressable>
    <Label heading>Bugün neye ihtiyacın var?</Label>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {modules.map((item) => <Pressable key={item.href.toString()} accessibilityRole="button" accessibilityLabel={item.label} onPress={() => router.push(item.href)}
        style={({ pressed }) => ({ flexBasis: '47%', flexGrow: 1, minHeight: 154, padding: 14, borderRadius: geometry.radius, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 7, opacity: pressed ? 0.75 : 1, boxShadow: [{ offsetX: 0, offsetY: 4, blurRadius: 18, color: colors.shadow + '0F' }] })}>
        <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: colors[`${item.tone}Soft`], alignItems: 'center', justifyContent: 'center' }}><Text accessible={false} style={{ fontSize: 26, color: colors[item.tone] }}>{item.icon}</Text></View>
        <Label>{item.label}</Label><Note>{item.description}</Note>
      </Pressable>)}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Acil veteriner" onPress={() => router.push('/emergency')}
      style={{ minHeight: 68, borderRadius: 14, backgroundColor: colors.redSoft, borderWidth: 1, borderColor: colors.red, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
      <Text accessible={false} style={{ color: colors.danger, fontSize: 26 }}>✚</Text><View style={{ flex: 1 }}><Text style={{ color: colors.danger, fontSize: 16, fontWeight: '800' }}>Acil veteriner</Text><Note>İletişim seçeneklerini aç</Note></View><Text accessible={false} style={{ color: colors.danger, fontSize: 22 }}>→</Text>
    </Pressable>
  </Screen>;
}
