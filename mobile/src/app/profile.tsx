import { useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Button, Card, Field, Label, Note, PetSelector, Screen } from '../components/ui';
import { useApp } from '../state/app-state';
import { appendPhotos } from '../core/model';
import { nativeServices } from '../services/native';
import { resultMessage } from '../core/services';
function ProfileEditor() {
  const { pet, updatePet, colors } = useApp();
  const nameArea = useRef<View>(null);
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
    <PetSelector disabled={busy} />
    <Card focusArea={nameArea}><Field focusArea={nameArea} label="Hayvanın adı" value={name} onChangeText={setName} maxLength={50} returnKeyType="done" />
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
    <View style={{ backgroundColor: colors.greenDark, borderRadius: 20, padding: 18, gap: 12 }}>
      <Text accessibilityRole="header" style={{ color: colors.white, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>PETID · DİJİTAL KİMLİK 🐾</Text>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}><Text accessible={false} style={{ fontSize: 38 }}>{pet.species === 'Kedi' ? '🐱' : '🐶'}</Text><View style={{ flex: 1, gap: 4 }}><Text style={{ color: colors.white, fontSize: 20, fontWeight: '800' }}>{pet.name}</Text><Text style={{ color: colors.white, fontSize: 14 }}>{pet.species} · {pet.age}</Text></View></View>
      <Text style={{ color: colors.white, fontSize: 14 }}>{pet.id} · Örnek kimlik</Text>
      <Text style={{ color: colors.white, fontSize: 14, lineHeight: 21 }}>QR paylaşımı kapalıdır. İzin verilen alanlar, paylaşım iptali ve yetkisiz erişim kontrolleri backend diliminde uygulanacak. Bu kimlik gerçek kayıt değildir.</Text>
    </View>
  </Screen>;
}
export default function Profile() {
  const { pet } = useApp();
  return <ProfileEditor key={pet.id} />;
}
