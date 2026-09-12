import { useState } from 'react';
import { Image, View } from 'react-native';
import { Button, Card, Field, Label, Note, Screen } from '../components/ui';
import { useApp } from '../state/app-state';
import { appendPhotos } from '../core/model';
import { nativeServices } from '../services/native';
import { resultMessage } from '../core/services';
function ProfileEditor() {
  const { pets, pet, selectPet, updatePet } = useApp();
  const [name, setName] = useState(pet.name);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function pickPhotos() {
    setBusy(true);
    const id = pet.id;
    const result = await nativeServices.pickPhotos();
    if (result.status === 'success') {
      updatePet(id, { photos: appendPhotos(pet.photos, result.value) });
      setMessage('Fotoğraflar yalnızca bu demo oturumuna eklendi. En fazla 5 fotoğraf.');
    } else setMessage(resultMessage(result));
    setBusy(false);
  }
  return <Screen title="Hayvan profili">
    <Card><Label>Aktif hayvan</Label>{pets.map((item) => <Button key={item.id} label={item.name + (item.id === pet.id ? ' · seçili' : ' profiline geç')} secondary onPress={() => selectPet(item.id)} disabled={busy} />)}</Card>
    <Card><Field label="Hayvanın adı" value={name} onChangeText={setName} maxLength={50} />
      <Note>{pet.species} · {pet.age}</Note>
      <Button label="Demo profili kaydet" disabled={!name.trim() || busy} onPress={() => { updatePet(pet.id, { name: name.trim() }); setMessage('Profil yalnızca bu oturumda güncellendi.'); }} />
    </Card>
    <Card><Label heading>Fotoğraflar</Label><Note>{pet.photos.length}/5 · Galeriden seçilir; sunucuya yüklenmez.</Note>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{pet.photos.map((uri, index) => <View key={uri} style={{ gap: 8 }}>
        <Image source={{ uri }} accessibilityLabel={pet.name + ' fotoğraf ' + (index + 1)} style={{ width: 116, height: 116, borderRadius: 16 }} />
        <Button secondary label={'Fotoğraf ' + (index + 1) + ' sil'} disabled={busy} onPress={() => updatePet(pet.id, { photos: pet.photos.filter((photo) => photo !== uri) })} />
      </View>)}</View>
      <Button label="Galeriden fotoğraf seç" disabled={busy || pet.photos.length >= 5} onPress={() => void pickPhotos()} />
      {message ? <Note>{message}</Note> : null}
    </Card>
    <Card><Label heading>Dijital kimlik</Label><Label>{pet.name} · {pet.id}</Label>
      <Note>QR paylaşımı kapalıdır. İzin verilen alanlar, paylaşım iptali ve yetkisiz erişim kontrolleri backend diliminde uygulanacak. Bu kimlik gerçek kayıt değildir.</Note>
    </Card>
  </Screen>;
}
export default function Profile() {
  const { pet } = useApp();
  return <ProfileEditor key={pet.id} />;
}
