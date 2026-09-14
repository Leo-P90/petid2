import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Label, Note, Screen, RouteButton, PetSelector, Segments, useSectionColors } from '../../components/ui';
import { useApp } from '../../state/app-state';
import { nativeServices } from '../../services/native';
import { resultMessage, type SelectedFile } from '../../core/services';
import { HealthAccount } from '../../components/health-account';
import { useAuth } from '../../state/auth-state';
export default function Health() {
  const { pet, accountMode } = useApp(); const auth = useAuth(); const colors = useSectionColors('health');
  const [tab, setTab] = useState('Aşılar');
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
  return <Screen title="Sağlık defteri" tab tone="health">
    <PetSelector disabled={busy} />
    <View style={{ backgroundColor: colors.greenSoft, borderRadius: 20, padding: 18, gap: 8 }}><Label heading>{pet.name} için bakım özeti</Label><Note>{accountMode ? 'Sağlık kayıtlarınız ve özel belgeleriniz aşağıda listelenir.' : 'Henüz kayıtlı bakım tarihi yok. Sağlık skoru veya bildirim hesaplanmıyor.'}</Note></View>
    <Segments labels={['Aşılar', 'Geçmiş', 'İlaçlar', 'Kilo']} selected={tab} onSelect={setTab} />
    {accountMode && auth.session ? pet.id ? <HealthAccount key={`${auth.session.user.id}/${pet.id}`} ownerId={auth.session.user.id} petId={pet.id} tab={tab} /> : <Note>Sağlık kaydı eklemek için önce hayvan profili oluşturun.</Note> : <>
    <Card><Label heading>{tab}</Label><View style={{ paddingVertical: 20, gap: 10 }}><Label>Henüz {tab === 'Kilo' ? 'ölçüm' : 'kayıt'} yok</Label><Note>{pet.name} için bu alanda gerçek veya örnek kayıt bulunmuyor. Uydurma tarih, ilaç veya kilo bilgisi gösterilmez.</Note></View></Card>
    <RouteButton label="Hayvan değiştir" href="/profile" />
    <Card><Label heading>Sağlık belgesi seçimi</Label><Note>PDF veya görsel · En fazla 10 MB · Yalnızca cihaz önizleme hazırlığı.</Note>
      <Button label="Cihazdan belge seç" disabled={busy} onPress={() => void selectFile()} />
      {files[pet.id] ? <Note>Seçilen dosya: {files[pet.id].name}</Note> : null}
      {messages[pet.id] ? <Note>{messages[pet.id]}</Note> : null}
    </Card>
    </>}
  </Screen>;
}

