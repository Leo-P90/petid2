import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { Button, Card, Field, Label, Note, Screen } from '../components/ui';
import { LocationPreview } from '../components/location-preview';
import { useApp } from '../state/app-state';
import { nativeServices } from '../services/native';
import { resultMessage, type Coordinates } from '../core/services';
import { validCoordinates } from '../core/model';
export default function Reports() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { pet } = useApp();
  const [kind, setKind] = useState<'Kayıp' | 'Yaralı'>('Kayıp');
  const [ownPet, setOwnPet] = useState(source !== 'street');
  const [condition, setCondition] = useState<'Yardıma ihtiyacı var' | 'Güvende'>('Yardıma ihtiyacı var');
  const [photo, setPhoto] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<string[]>([]);
  async function selectPhoto() {
    setBusy(true);
    const result = await nativeServices.pickPhotos();
    if (result.status === 'success' && result.value[0]) { setPhoto(result.value[0]); setNotice('Fotoğraf yalnızca taslak önizlemesine eklendi.'); }
    else setNotice(resultMessage(result));
    setBusy(false);
  }
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
    <Card><Label heading>Yaralı / kayıp hayvan bildir</Label><Note>Önce güvenli taslağını gözden geçir; buradan ilan yayınlanmaz.</Note>
      <Button secondary label={'İlan türü: ' + kind + ' · değiştir'} onPress={() => setKind(kind === 'Kayıp' ? 'Yaralı' : 'Kayıp')} />
      <Button secondary label={ownPet ? pet.name + ' için · başka hayvana geç' : 'Başka hayvan için · profil hayvanına geç'} onPress={() => setOwnPet(!ownPet)} />
      <Button secondary label={'Durum: ' + condition + ' · değiştir'} onPress={() => setCondition(condition === 'Yardıma ihtiyacı var' ? 'Güvende' : 'Yardıma ihtiyacı var')} />
      <Button label="Cihazdan fotoğraf seç" secondary disabled={busy} onPress={() => void selectPhoto()} />
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
      <Field label="Adres / yakın nokta (elle giriş)" value={address} onChangeText={setAddress} placeholder="Örn. sokak, park veya semt" maxLength={160} />
      <View style={{ gap: 8, borderRadius: 17, backgroundColor: '#F5F0FF', padding: 12 }}><Label heading>Taslak önizlemesi</Label>{photo ? <Image accessibilityLabel="Taslak fotoğrafı" source={{ uri: photo }} style={{ width: 104, height: 104, borderRadius: 12 }}/> : <Note>Fotoğraf seçilmedi.</Note>}<Note>{kind} · {ownPet ? pet.name : 'Sokakta görülen başka hayvan'} · {condition}</Note><Note>{position ? `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}` : address.trim() || 'Konum veya adres ekleyin.'}</Note><Text numberOfLines={2}>{description.trim() || 'Kısa açıklama ekleyin.'}</Text></View>
      <Button label="Yayınlamadan demo taslağı ekle" disabled={!photo || (!position && !address.trim()) || !description.trim()} onPress={() => {
        setDrafts((previous) => [...previous, kind + ' · ' + condition + ' · ' + (ownPet ? pet.name : 'Başka hayvan') + ' · ' + description.trim()]);
        setNotice('Taslak yalnızca cihaz oturumunda. Gerçek ilan yayınlanmadı.'); setDescription('');
      }} />
      {notice ? <Note>{notice}</Note> : null}
    </Card>
    <Card><Label heading>Demo taslakları</Label>{drafts.length ? drafts.map((draft, index) => <Note key={index}>{draft}</Note>) : <Note>Henüz taslak yok.</Note>}
      <Note>Gördüm/güvende ihbarı, sahibi onayı, kapatma ve arşivleme yetkileri sonraki backend dilimindedir. İhbar ilanı kendiliğinden kapatmaz.</Note>
    </Card>
  </Screen>;
}
