import { useState } from 'react';
import { Keyboard, Modal, View } from 'react-native';
import { Button, Card, Label, Note, Screen, PetSelector, Segments } from '../../components/ui';
import { HealthSummary } from '../../components/health-summary';
import { useApp } from '../../state/app-state';
import { nativeServices } from '../../services/native';
import { resultMessage, type SelectedFile } from '../../core/services';
import { HealthAccount } from '../../components/health-account';
import { useAuth } from '../../state/auth-state';
export default function Health() {
  const { pet, accountMode } = useApp(); const auth = useAuth();
  const [details, setDetails] = useState(false);
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
  return <Screen title="Sağlık" tab tone="health">
    <PetSelector disabled={busy} />
    <View style={{ paddingVertical: 8, gap: 4 }}><Label heading>{pet.name} için küçük bakımlar</Label><Note>Her güzel gün, biraz özenle başlar.</Note></View>
    {accountMode && auth.session ? pet.id ? <HealthAccount key={`${auth.session.user.id}/${pet.id}`} ownerId={auth.session.user.id} petId={pet.id} tab={tab} overview /> : <Note>Önce hayvan profili oluşturun.</Note> : <HealthSummary onOpen={next => { setTab(next); setDetails(true); }} />}
    <Modal visible={details && !accountMode} onRequestClose={() => { Keyboard.dismiss(); setDetails(false); }}><Screen title="Sağlık kayıtları" tone="health"><Button label="Sağlık detayını kapat" secondary onPress={() => { Keyboard.dismiss(); setDetails(false); }} /><Segments labels={['Aşılar', 'Geçmiş', 'İlaçlar', 'Kilo']} selected={tab} onSelect={setTab} />
    <Card><Label heading>{tab}</Label><View style={{ paddingVertical: 20, gap: 10 }}><Label>Henüz {tab === 'Kilo' ? 'ölçüm' : 'kayıt'} yok</Label><Note>{pet.name} için bu alanda gerçek veya örnek kayıt bulunmuyor. Uydurma tarih, ilaç veya kilo bilgisi gösterilmez.</Note></View></Card>
    <Card><Label heading>Sağlık belgesi seçimi</Label><Note>PDF veya görsel · En fazla 10 MB · Yalnızca cihaz önizleme hazırlığı.</Note>
      <Button label="Cihazdan belge seç" disabled={busy} onPress={() => void selectFile()} />
      {files[pet.id] ? <Note>Seçilen dosya: {files[pet.id].name}</Note> : null}
      {messages[pet.id] ? <Note>{messages[pet.id]}</Note> : null}
    </Card>
    </Screen></Modal>
  </Screen>;
}

