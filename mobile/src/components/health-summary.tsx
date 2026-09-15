import { Pressable, Text, View } from 'react-native';
import { BrandIcon, fonts } from './brand';
import { Note, useSectionColors } from './ui';
import type { HealthRecord } from '../core/health';
const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const shortDate = (value: string) => { const [y,m,d] = value.split('-'); return `${Number(d)} ${months[Number(m)-1]} ${y}`; };
const tiles = [
  { name: 'Aşılar', tab: 'Aşılar', kind: 'vaccine', icon: 'vaccine' },
  { name: 'Parazit Koruması', tab: 'İlaçlar', kind: 'medication', icon: 'shield' },
  { name: 'Genel Kontrol', tab: 'Geçmiş', kind: 'exam', icon: 'heart' },
  { name: 'Diş ve Ağız', tab: 'Geçmiş', kind: 'exam', icon: 'tooth' },
] as const;
function belongs(row: HealthRecord, name: string) {
  if (name === 'Parazit Koruması') return row.kind === 'medication' && /parazit/i.test(row.title);
  if (name === 'Diş ve Ağız') return row.kind === 'exam' && /diş|ağız/i.test(row.title);
  if (name === 'Genel Kontrol') return row.kind === 'exam' && !/diş|ağız/i.test(row.title);
  return row.kind === 'vaccine';
}
export function HealthSummary({ records = [], loaded = true, message = '', onOpen, sample = false }: { records?: HealthRecord[]; loaded?: boolean; message?: string; onOpen: (tab: string) => void; sample?: boolean }) {
  const colors = useSectionColors('health'); const today = new Date().toISOString().slice(0, 10);
  const due = records.filter(row => row.due_on && row.due_on >= today).sort((a,b) => a.due_on!.localeCompare(b.due_on!))[0];
  const noRecords = loaded && records.length === 0;
  return <><View style={{ gap: 4 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: colors.text, fontFamily: fonts.display, fontSize: 25 }}>Sağlık</Text>{sample ? <Text style={{ color: colors.accent, fontFamily: fonts.strong, fontSize: 11 }}>ÖRNEK BAKIM PLANI</Text> : null}</View><Text style={{ color: colors.text, fontFamily: fonts.body, fontSize: 13 }}>Küçük bakımlar, güzel günler.</Text></View>
  {noRecords ? <Pressable accessibilityRole="button" accessibilityLabel="İlk bakım kaydını aç" onPress={() => onOpen('Geçmiş')} style={{ padding: 12, borderRadius: 17, backgroundColor: colors.purpleSoft, flexDirection: 'row', alignItems: 'center', gap: 8 }}><BrandIcon name="sparkle" color={colors.accent} size={20}/><Text style={{ color: colors.text, fontFamily: fonts.strong, fontSize: 13, flex: 1 }}>Bakım geçmişini birlikte oluşturalım.</Text><BrandIcon name="chevron" color={colors.accent} size={15}/></Pressable> : null}
  <View testID="health-summary-grid" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{tiles.map(tile => {
    const last = records.filter(row => belongs(row,tile.name)).sort((a,b) => b.occurred_on.localeCompare(a.occurred_on))[0];
    return <Pressable key={tile.name} accessibilityRole="button" accessibilityLabel={tile.name + ' kayıtlarını aç'} onPress={() => onOpen(tile.tab)} style={{ width: '48%', flexGrow: 1, minHeight: 108, borderRadius: 18, padding: 10, gap: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, boxShadow: [{ offsetX: 0, offsetY: 3, blurRadius: 12, color: colors.shadow + '0C' }] }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: last ? '#E4F5ED' : colors.purpleSoft, alignItems: 'center', justifyContent: 'center' }}><BrandIcon name={tile.icon} color={last ? colors.green : colors.accent} size={22}/></View>{last ? <View style={{ backgroundColor: colors.green, width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontSize: 14 }}>✓</Text></View> : null}</View><Text numberOfLines={2} style={{ color: colors.text, fontFamily: fonts.strong, fontSize: 13, lineHeight: 17 }}>{tile.name}</Text><Text numberOfLines={1} style={{ color: last ? colors.greenDark : colors.muted, fontFamily: fonts.strong, fontSize: 11 }}>{!loaded ? 'Yükleniyor…' : last ? sample ? 'Örnek · kayıtlı' : 'Kayıtlı' : 'Takibe hazır'}</Text><Text numberOfLines={1} style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 11 }}>{last ? 'Son: '+shortDate(last.occurred_on) : 'Kayıtlarını aç ›'}</Text></Pressable>;
  })}</View>
  <View style={{ gap: 8 }}><Text style={{ color: colors.text, fontFamily: fonts.display, fontSize: 21 }}>Sıradaki Bakım</Text><Pressable accessibilityRole="button" accessibilityLabel="Sağlık kayıtları ve belgeler" onPress={() => onOpen('Geçmiş')} style={{ minHeight: 90, padding: 10, borderRadius: 22, backgroundColor: colors.purpleSoft, flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#DDD2FF', alignItems: 'center', justifyContent: 'center' }}><BrandIcon name="paw" color={colors.accent} size={26}/></View><View style={{ flex: 1, gap: 4 }}><Text numberOfLines={1} style={{ color: colors.text, fontFamily: fonts.strong, fontSize: 15 }}>{due?.title ?? 'Bir sonraki küçük bakım'}</Text><Text style={{ color: colors.text, fontFamily: fonts.body, fontSize: 13 }}>{due?.due_on ? shortDate(due.due_on) : 'Henüz planlanmış bakım yok.'}</Text><Text numberOfLines={1} style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 11 }}>{sample ? 'Örnek hatırlatma · gerçek kayıt değil' : due?.notes || 'Bakım takvimini aç'}</Text></View><BrandIcon name="chevron" color={colors.accent} size={20}/></Pressable></View>
  <Pressable accessibilityRole="button" accessibilityLabel="Kilo kayıtlarını aç" onPress={() => onOpen('Kilo')} style={{ minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center' }}><Text style={{ color: colors.accent, fontFamily: fonts.strong, fontSize: 13 }}>Kilo takibi ve tüm kayıtlar ›</Text></Pressable>
  {message ? <Note>{message}</Note> : null}</>;
}
