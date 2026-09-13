import { useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Button, Card, Field, Label, Note, PetSelector, Screen, PetPortrait, RouteButton } from '../components/ui';
import { useApp } from '../state/app-state';
import { appendPhotos } from '../core/model';
import { nativeServices } from '../services/native';
import { resultMessage } from '../core/services';
function ProfileEditor() {
  const { pet, updatePet, colors, accountMode, petsBusy, petNotice, deletePet, createPet, addPhoto, removePhoto } = useApp();
  const nameArea = useRef<View>(null);
  const [name, setName] = useState(pet.name);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(''); const [newAge, setNewAge] = useState('');
  const [newSpecies, setNewSpecies] = useState<'Kedi' | 'Köpek'>('Kedi');
  async function pickPhotos() {
    setBusy(true);
    try {
      const id = pet.id;
      const result = await nativeServices.pickPhotos();
      if (result.status === 'success') {
        if (accountMode) {
          for (const uri of result.value.slice(0, 5 - pet.photos.length)) await addPhoto(uri);
          setMessage('Fotoğraflar özel depoya yüklendi.');
        } else {
          await updatePet(id, { photos: appendPhotos(pet.photos, result.value) });
          setMessage('Fotoğraflar yalnızca bu demo oturumuna eklendi. En fazla 5 fotoğraf.');
        }
      } else setMessage(resultMessage(result));
    } catch { setMessage('Fotoğraf işlemi tamamlanamadı.'); }
    finally { setBusy(false); }
  }
  return <Screen title="Dostum">
    <PetSelector disabled={busy} />
    <View style={{ backgroundColor: '#194B38', borderRadius: 24, padding: 24, gap: 14 }}><Text style={{ color: '#BEDACA', fontSize: 11, letterSpacing: 2 }}>PETID / DİJİTAL KİMLİK</Text><PetPortrait key={pet.id + pet.photos[0]} size={90} /><Text accessibilityRole="header" style={{ color: colors.white, fontSize: 31, fontWeight: '800' }}>{pet.name}</Text><Text style={{ color: '#C9DDD2', fontSize: 14 }}>{pet.species} · {pet.age}</Text><Text style={{ color: '#C9DDD2', fontSize: 13 }}>QR paylaşımı ve doğrulanmış kimlik sunulmaz.</Text></View>
    <Button secondary label={editing ? 'Düzenlemeyi kapat' : 'Profili düzenle'} onPress={() => setEditing(!editing)} />
    {editing ? <Card focusArea={nameArea}><Field focusArea={nameArea} label="Hayvanın adı" value={name} onChangeText={setName} maxLength={50} returnKeyType="done" />
      <Note>{pet.species} · {pet.age}</Note>
      <Button label={accountMode ? 'Profili kaydet' : 'Demo profili kaydet'} disabled={!name.trim() || busy || petsBusy} onPress={() => { void updatePet(pet.id, { name: name.trim() }).then(() => setMessage(accountMode ? 'Profil kaydedildi.' : 'Profil yalnızca bu oturumda güncellendi.')); }} />
      {accountMode ? <Button secondary label="Hayvan profilini sil" disabled={busy || petsBusy} onPress={() => void deletePet(pet.id)} /> : null}
    </Card> : null}
    {accountMode ? <Card><Label heading>Başka bir dost ekle</Label><Field label="Yeni hayvanın adı" value={newName} onChangeText={setNewName} maxLength={50} /><Field label="Yeni hayvanın yaşı" value={newAge} onChangeText={setNewAge} maxLength={40} />
      <Button secondary label={`Yeni tür: ${newSpecies}`} onPress={() => setNewSpecies(newSpecies === 'Kedi' ? 'Köpek' : 'Kedi')} />
      <Button label="Yeni hayvan profili oluştur" disabled={petsBusy || !newName.trim() || !newAge.trim()} onPress={() => void createPet({ name: newName, age: newAge, species: newSpecies })} /></Card> : null}
    <Card><Label heading>Küçük anılar</Label><Note>{pet.photos.length}/5 · {accountMode ? 'Özel hesap fotoğrafları' : 'Galeriden seçilir; sunucuya yüklenmez.'}</Note>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{pet.photos.map((uri, index) => <View key={uri} style={{ gap: 8 }}>
        <Image source={{ uri }} accessibilityLabel={pet.name + ' fotoğraf ' + (index + 1)} style={{ width: 116, height: 116, borderRadius: 16 }} />
        <Button secondary label={'Fotoğraf ' + (index + 1) + ' sil'} disabled={busy || petsBusy} onPress={() => void removePhoto(uri)} />
      </View>)}</View>
      <Button label="Galeriden fotoğraf seç" disabled={busy || pet.photos.length >= 5} onPress={() => void pickPhotos()} />
      {message ? <Note>{message}</Note> : null}{petNotice ? <Note>{petNotice}</Note> : null}
    </Card>
    <Label heading>{pet.name} için</Label><RouteButton label="Sağlık defteri ve belgeler" href="/health" /><RouteButton label="Hesap ve oturum" href="/account" />
  </Screen>;
}
export default function Profile() {
  const { pet } = useApp();
  return <ProfileEditor key={pet.id} />;
}
