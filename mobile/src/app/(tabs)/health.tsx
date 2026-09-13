import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Label, Note, Screen, RouteButton, PetSelector } from '../../components/ui';
import { useApp } from '../../state/app-state';
import { nativeServices } from '../../services/native';
import { resultMessage, type SelectedFile } from '../../core/services';
export default function Health() {
  const { pet, colors } = useApp();
  const [files, setFiles] = useState<Record<string, SelectedFile>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  async function selectFile() {
    setBusy(true);
    const id = pet.id;
    const result = await nativeServices.pickFile();
    if (result.status === 'success') {
      setFiles((previous) => ({ ...previous, [id]: result.value }));
      setMessages((previous) => ({ ...previous, [id]: 'Belge cihazdan seçildi; sunucuya yüklenmedi ve veteriner onaylı değildir.' }));
    } else setMessages((previous) => ({ ...previous, [id]: resultMessage(result) }));
    setBusy(false);
  }
  return <Screen title={pet.name + ' · Sağlık'} tab>
    <PetSelector disabled={busy} />
    <RouteButton label="Hayvan değiştir" href="/profile" />
    <Card><Label heading>Hayvana özel geçmiş</Label>
      {[['💉', 'Aşı', colors.greenSoft], ['💊', 'İlaç', colors.amberSoft], ['⚖️', 'Kilo', colors.blueSoft], ['🩺', 'Muayene', colors.redSoft]].map(([icon, category, tone]) => <View key={category} style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 16, backgroundColor: tone }}><View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}><Label>{icon}</Label></View><View style={{ flex: 1 }}><Label>{category}</Label><Note>Bu demo hayvan için henüz kayıt yok.</Note></View></View>)}
      <Note>Gerçek sağlık kaydı, owner/pet ayrımı ve private dosya yükleme/indirme sonraki dilimdedir.</Note>
    </Card>
    <Card><Label heading>Sağlık belgesi seçimi</Label><Note>PDF veya görsel · En fazla 10 MB · Yalnızca cihaz önizleme hazırlığı.</Note>
      <Button label="Cihazdan belge seç" disabled={busy} onPress={() => void selectFile()} />
      {files[pet.id] ? <Note>Seçilen dosya: {files[pet.id].name}</Note> : null}
      {messages[pet.id] ? <Note>{messages[pet.id]}</Note> : null}
    </Card>
  </Screen>;
}

