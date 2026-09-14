import { Pressable, Text, View } from 'react-native';
import { Button, Card, Label, Note, useSectionColors } from './ui';
import type { HealthRecord } from '../core/health';
export function HealthSummary({ records = [], loaded = true, message = '', onOpen }: { records?: HealthRecord[]; loaded?: boolean; message?: string; onOpen: (tab: string) => void }) {
  const colors = useSectionColors('health');
  const tiles = [{ name: 'Aşı', tab: 'Aşılar', kind: 'vaccine', icon: '+' }, { name: 'Parazit', tab: 'İlaçlar', kind: 'medication', icon: '✧' }, { name: 'Genel kontrol', tab: 'Geçmiş', kind: 'exam', icon: '♡' }, { name: 'Kilo', tab: 'Kilo', kind: 'weight', icon: '◴' }];
  const today = new Date().toISOString().slice(0, 10);
  const due = records.filter(row => row.due_on && row.due_on >= today).sort((a, b) => a.due_on!.localeCompare(b.due_on!))[0];
  return <><View testID="health-summary-grid" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{tiles.map(tile => {
    // Medication is not necessarily parasite care: do not invent a medical status.
    const last = records.filter(row => row.kind === tile.kind && (tile.name !== 'Parazit' || /parazit/i.test(row.title))).sort((a, b) => b.occurred_on.localeCompare(a.occurred_on))[0];
    return <Pressable key={tile.name} accessibilityRole="button" accessibilityLabel={tile.name + ' kayıtlarını aç'} onPress={() => onOpen(tile.tab)} style={{ width: '48%', flexGrow: 1, minHeight: 116, borderRadius: 22, padding: 16, gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.accent, fontSize: 27 }}>{tile.icon}</Text><Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{tile.name}</Text><Text numberOfLines={2} style={{ color: colors.muted, fontSize: 12 }}>{!loaded ? 'Yükleniyor…' : last ? tile.kind === 'weight' ? `${last.weight_kg} kg · ${last.occurred_on}` : last.occurred_on : 'Henüz kayıt yok'}</Text></Pressable>;
  })}</View><Card><Label heading>Sıradaki bakım</Label><Label>{due?.title || 'Bir sonraki küçük bakım'}</Label><Note>{due?.due_on || 'Henüz planlanmış bakım yok.'}</Note><Button label="Sağlık kayıtları ve belgeler" secondary onPress={() => onOpen('Geçmiş')} /></Card>{message ? <Note>{message}</Note> : null}</>;
}
