import { useState } from 'react';
import { Button, Card, Field, Label, Note, Screen } from '../components/ui';
import { LocationPreview } from '../components/location-preview';
import { useApp } from '../state/app-state';
import { nativeServices } from '../services/native';
import { resultMessage, type Coordinates } from '../core/services';
import { validCoordinates } from '../core/model';
export default function Reports() {
  const { pet } = useApp();
  const [kind, setKind] = useState<'Kayıp' | 'Yaralı'>('Kayıp');
  const [ownPet, setOwnPet] = useState(true);
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<string[]>([]);
  async function locate() {
    setBusy(true);
    const result = await nativeServices.locate();
    if (result.status === 'success') {
      setPosition(result.value); setLatitude(String(result.value.latitude)); setLongitude(String(result.value.longitude));
      setNotice('Cihaz konumu alındı. İlan yayınlanmadı.');
    } else setNotice(resultMessage(result));
    setBusy(false);
  }
  return <Screen title="Kayıp / yaralı">
    <Card><Label heading>İlan taslağı</Label>
      <Button secondary label={'İlan türü: ' + kind + ' · değiştir'} onPress={() => setKind(kind === 'Kayıp' ? 'Yaralı' : 'Kayıp')} />
      <Button secondary label={ownPet ? pet.name + ' için · başka hayvana geç' : 'Başka hayvan için · profil hayvanına geç'} onPress={() => setOwnPet(!ownPet)} />
      <Field label="İlan açıklaması" multiline value={description} onChangeText={setDescription} maxLength={1000} />
      <Button label="Cihaz konumunu al" disabled={busy} onPress={() => void locate()} />
      <Field label="Enlem" keyboardType="numbers-and-punctuation" value={latitude} onChangeText={(value) => { setLatitude(value); setPosition(null); }} />
      <Field label="Boylam" keyboardType="numbers-and-punctuation" value={longitude} onChangeText={(value) => { setLongitude(value); setPosition(null); }} />
      <Button secondary label="Koordinatları önizle" onPress={() => {
        const lat = Number(latitude.replace(',', '.')); const lng = Number(longitude.replace(',', '.'));
        if (!latitude.trim() || !longitude.trim() || !validCoordinates(lat, lng)) { setNotice('Geçerli enlem (-90…90) ve boylam (-180…180) girin.'); return; }
        setPosition({ latitude: lat, longitude: lng }); setNotice('Koordinatlar önizlendi.');
      }} />
      <LocationPreview position={position} />
      <Button label="Yayınlamadan demo taslağı ekle" disabled={!position || !description.trim()} onPress={() => {
        setDrafts((previous) => [...previous, kind + ' · ' + (ownPet ? pet.name : 'Başka hayvan') + ' · ' + description.trim()]);
        setNotice('Taslak yalnızca cihaz oturumunda. Gerçek ilan yayınlanmadı.'); setDescription('');
      }} />
      {notice ? <Note>{notice}</Note> : null}
    </Card>
    <Card><Label heading>Demo taslakları</Label>{drafts.length ? drafts.map((draft, index) => <Note key={index}>{draft}</Note>) : <Note>Henüz taslak yok.</Note>}
      <Note>Gördüm/güvende ihbarı, sahibi onayı, kapatma ve arşivleme yetkileri sonraki backend dilimindedir. İhbar ilanı kendiliğinden kapatmaz.</Note>
    </Card>
  </Screen>;
}
