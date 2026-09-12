import { View } from 'react-native';
import { Label, Note } from './ui';
import type { Coordinates } from '../core/services';
export function LocationPreview({ position }: { position: Coordinates | null }) {
  return <View style={{ minHeight: 140, justifyContent: 'center', gap: 8 }}>
    <Label>Harita bağlantı noktası</Label>
    <Note>{position ? position.latitude.toFixed(5) + ', ' + position.longitude.toFixed(5) : 'Konum seçilmedi.'}</Note>
    <Note>Bu dilimde koordinat önizlemesidir; interaktif harita ve canlı ilan işaretleri henüz bağlanmadı.</Note>
  </View>;
}
