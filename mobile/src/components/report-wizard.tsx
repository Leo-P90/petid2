import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo, Image, LayoutAnimation, Pressable, Text, View } from 'react-native';
import { useApp } from '../state/app-state';
import { useAuth } from '../state/auth-state';
import { nativeServices } from '../services/native';
import { resultMessage } from '../core/services';
import { createSubmissionGuard, emptyReport, publicReport, reportError, situationLabel, type ReportDraft, type ReportPayload, type Situation, type Species } from '../core/report';
import { BrandIcon, fonts } from './brand';
import { Button, Card, Field, Label, Note, Screen } from './ui';
import { PetSketch } from './pet-sketch';

const sessions = new Map<string, ReportDraft>();
const situations: { value: Situation; tone: string }[] = [
  { value: 'lost', tone: '#B86A0B' }, { value: 'injured', tone: '#C64E59' }, { value: 'needs-help', tone: '#6757C9' },
];
export default function ReportWizard() {
  const { pets, colors } = useApp();
  const auth = useAuth();
  const ownerId = auth.demo ? 'demo' : auth.session?.user.id ?? 'signed-out';
  const [draft, setDraft] = useState<ReportDraft>(() => sessions.get(ownerId) ?? emptyReport());
  const [expanded, setExpanded] = useState(1);
  const [petPicker, setPetPicker] = useState(false);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState('');
  const [locationNotice, setLocationNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [published, setPublished] = useState<ReportPayload[]>([]);
  const [submitOnce] = useState(createSubmissionGuard);
  const reduced = useRef(false);
  useEffect(() => { Promise.resolve(AccessibilityInfo.isReduceMotionEnabled()).then(value => { reduced.current = !!value; }).catch(() => {}); }, []);
  useEffect(() => { sessions.set(ownerId, draft); }, [ownerId, draft]);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('petid.local-reports.' + ownerId).then(value => {
      if (active && value) setPublished(JSON.parse(value) as ReportPayload[]);
    }).catch(() => { if (active) setNotice('Yerel taslaklar okunamadı.'); });
    return () => { active = false; };
  }, [ownerId]);
  const update = (changes: Partial<ReportDraft>) => { setDraft(current => ({ ...current, ...changes })); setPreview(false); setNotice(''); };
  const reveal = (step: number) => { if (!reduced.current) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpanded(step); };
  const subjectReady = draft.subject === 'own' ? !!draft.pet : draft.subject === 'other' && !!draft.species;
  const infoReady = !!draft.situation && draft.description.trim().length >= 20 && draft.description.trim().length <= 500 && draft.photos.length > 0 && draft.photos.length <= 5 && !!draft.location.confirmed && !!draft.observedAt && Number.isFinite(new Date(draft.observedAt).getTime());
  async function choosePhotos() {
    if (busy || draft.photos.length >= 5) return;
    setBusy(true);
    const result = await nativeServices.pickPhotos();
    if (result.status === 'success') {
      const next = [...new Set([...draft.photos, ...result.value])].slice(0, 5);
      update({ photos: next });
      setNotice(result.value.length + draft.photos.length > 5 ? 'En fazla 5 fotoğraf eklendi.' : 'Fotoğraflar seçildi.');
    } else setNotice(resultMessage(result));
    setBusy(false);
  }
  async function locate() {
    if (busy) return;
    setBusy(true);
    const result = await nativeServices.locate();
    if (result.status === 'success') { update({ location: { address: draft.location.address, coordinates: result.value, confirmed: false } }); setLocationNotice('Cihaz noktası alındı; devam etmeden önce konumu onaylayın.'); }
    else setLocationNotice(resultMessage(result) + ' Adresi elle seçebilirsiniz.');
    setBusy(false);
  }
  function movePhoto(index: number, direction: -1 | 1) {
    const next = [...draft.photos]; const other = index + direction;
    if (other < 0 || other >= next.length) return;
    [next[index], next[other]] = [next[other], next[index]];
    update({ photos: next });
  }
  function nextFromInfo() {
    const error = reportError({ ...draft, audience: { community: true, vets: false } });
    if (error) { setNotice(error); return; }
    reveal(4);
  }
  function openPreview() {
    const error = reportError(draft);
    if (error) { setNotice(error); return; }
    setPreview(true); reveal(5);
  }
  async function saveLocal() {
    if (busy || reportError(draft)) return;
    await submitOnce(async () => {
      setBusy(true);
      try {
        const payload = publicReport(draft, ownerId);
        const next = [payload, ...published];
        await AsyncStorage.setItem('petid.local-reports.' + ownerId, JSON.stringify(next));
        setPublished(next);
        setNotice('Yerel demo taslağı kaydedildi. Gerçek ilan yayınlanmadı.');
        setPreview(false);
      } catch { setNotice('Yerel taslak kaydedilemedi. Yeniden deneyin.'); }
      finally { setBusy(false); }
    });
  }
  return <Screen title="Pati bildirimi oluştur" compact>
    <Card><Label heading>1 · Kimin için?</Label>
      {expanded === 1 || !subjectReady ? <><Choice label="Kendi hayvanım için" chosen={draft.subject === 'own'} onPress={() => { update({ subject: 'own', pet: null, species: null, name: '' }); setPetPicker(true); }} /><Choice label="Başka bir hayvan için" chosen={draft.subject === 'other'} onPress={() => { update({ subject: 'other', pet: null, species: null, name: '' }); setPetPicker(false); }} />
        {draft.subject === 'own' && petPicker ? <View style={{ gap: 8 }}><Note>Bildirim için hayvanınızı seçin.</Note>{pets.map(item => <Choice key={item.id} label={item.name + ' · ' + item.species} chosen={draft.pet?.id === item.id} onPress={() => { update({ pet: { id: item.id, name: item.name, species: item.species, age: item.age }, species: item.species, name: item.name }); setPetPicker(false); reveal(2); }} photo={item.photos[0]} species={item.species} />)}</View> : null}
        {draft.subject === 'other' ? <View style={{ gap: 8 }}><Label>Hayvanın türü</Label>{(['Kedi', 'Köpek', 'Diğer / bilmiyorum'] as Species[]).map(species => <Choice key={species} label={species} chosen={draft.species === species} onPress={() => { update({ species }); reveal(2); }} />)}{draft.species ? <Field label="Görünen ad (isteğe bağlı)" value={draft.name} onChangeText={name => update({ name })} maxLength={50} /> : null}</View> : null}</> : <Summary label="Kimin için?" value={draft.subject === 'own' ? draft.pet?.name ?? '' : `${draft.species}${draft.name ? ' · ' + draft.name : ''}`} onPress={() => reveal(1)} />}
    </Card>
    {subjectReady ? <Card><Label heading>2 · Ne oldu?</Label>{expanded === 2 || !draft.situation ? situations.map(item => <Choice key={item.value} label={situationLabel[item.value]} chosen={draft.situation === item.value} tone={item.tone} onPress={() => { update({ situation: item.value }); reveal(3); }} />) : <Summary label="Durum" value={situationLabel[draft.situation]} onPress={() => reveal(2)} />}</Card> : null}
    {subjectReady && draft.situation ? <Card><Label heading>3 · Bilgiler</Label>{expanded === 3 || !infoReady ? <>
      <Field label="Durumu kısaca anlat" multiline value={draft.description} onChangeText={description => update({ description })} maxLength={500} placeholder="Nerede gördünüz, görünür yarası veya davranışı nasıl?" />
      <Note>{draft.description.length}/500 · en az 20 karakter</Note>
      <Button label="Fotoğraf seç" secondary disabled={busy || draft.photos.length >= 5} onPress={() => void choosePhotos()} />
      <Note>{draft.photos.length}/5 fotoğraf · en az 1 zorunlu</Note>
      {draft.photos.map((uri, index) => <View key={uri} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Image accessibilityLabel={`Bildirim fotoğrafı ${index + 1}`} source={{ uri }} style={{ width: 64, height: 64, borderRadius: 10 }}/><MiniAction label={`${index + 1}. fotoğrafı sola taşı`} disabled={index === 0} onPress={() => movePhoto(index, -1)}>←</MiniAction><MiniAction label={`${index + 1}. fotoğrafı sağa taşı`} disabled={index === draft.photos.length - 1} onPress={() => movePhoto(index, 1)}>→</MiniAction><MiniAction label={`${index + 1}. fotoğrafı kaldır`} onPress={() => update({ photos: draft.photos.filter((_, i) => i !== index) })}>×</MiniAction></View>)}
      <Button label="Mevcut konumu kullan" secondary disabled={busy} onPress={() => void locate()} />
      {locationNotice ? <Note>{locationNotice}</Note> : null}
      <Field label="Haritadan / adresle seç" value={draft.location.address} onChangeText={address => update({ location: { address, confirmed: false } })} placeholder="Semt, sokak veya yakın nokta" maxLength={160}/>
      {draft.location.coordinates || draft.location.address.trim() ? <View style={{ borderRadius: 16, backgroundColor: colors.purpleSoft, padding: 14, gap: 6 }}><View accessibilityLabel="Şematik harita önizlemesi" style={{ height: 96, borderRadius: 12, overflow: 'hidden', backgroundColor: '#E9E5F6', justifyContent: 'center', alignItems: 'center' }}><View style={{ position: 'absolute', width: '130%', height: 13, backgroundColor: '#FFFFFF', transform: [{ rotate: '-19deg' }] }}/><View style={{ position: 'absolute', width: '130%', height: 9, backgroundColor: '#FFFFFF', transform: [{ rotate: '42deg' }] }}/><BrandIcon name="pin" color={colors.accent} size={30}/></View><Label>Konum önizlemesi</Label><Note>{draft.location.address.trim() || `${draft.location.coordinates?.latitude.toFixed(4)}, ${draft.location.coordinates?.longitude.toFixed(4)}`}</Note><Note>{draft.location.coordinates ? 'Cihaz noktası seçildi.' : 'Şematik harita · adres elle girildi; kesin pin doğrulanmadı.'}</Note></View> : null}
      <Button label={draft.location.confirmed ? 'Konum onaylandı' : 'Seçilen konumu onayla'} secondary disabled={!draft.location.address.trim() && !draft.location.coordinates} onPress={() => update({ location: { ...draft.location, confirmed: true } })}/>
      <Field label={draft.situation === 'lost' && draft.subject === 'own' ? 'Son görülme zamanı' : 'Görülme zamanı'} value={draft.observedAt} onChangeText={observedAt => update({ observedAt })} placeholder="2026-09-19T14:30" autoCapitalize="none"/>
      <Note>Biçim: YYYY-AA-GGTS:DD · gelecek zaman kabul edilmez.</Note><Button label="Bilgilere devam" disabled={!infoReady} onPress={nextFromInfo}/>
    </> : <Summary label="Bilgiler" value={`${draft.photos.length} fotoğraf · ${draft.location.address || 'Cihaz konumu'}`} onPress={() => reveal(3)}/>}</Card> : null}
    {infoReady && expanded >= 4 ? <Card><Label heading>4 · Kimler görsün?</Label>{expanded === 4 || !preview ? <><Toggle label="Topluluğa göster" detail="Yaklaşık bölge paylaşılır; kesin nokta gösterilmez." selected={draft.audience.community} onPress={() => update({ audience: { ...draft.audience, community: !draft.audience.community } })}/><Toggle label="Veterinerlere göster" detail="Yakındaki katılımcı veterinerlerle paylaşılır; acil müdahale garantisi değildir." selected={draft.audience.vets} onPress={() => update({ audience: { ...draft.audience, vets: !draft.audience.vets } })}/><Button label="Bildirimi önizle" disabled={!draft.audience.community && !draft.audience.vets} onPress={openPreview}/></> : <Summary label="Hedef kitle" value={[draft.audience.community && 'Topluluk', draft.audience.vets && 'Veterinerler'].filter(Boolean).join(' · ')} onPress={() => reveal(4)}/>}</Card> : null}
    {preview ? <Card><Label heading>5 · Bildirim önizlemesi</Label><Note>Bu demo gerçek ilan yayınlamaz.</Note><Image accessibilityLabel="Bildirim önizleme fotoğrafı" source={{ uri: draft.photos[0] }} style={{ width: '100%', height: 170, borderRadius: 14 }}/><Label>{draft.subject === 'own' ? draft.pet?.name : draft.name || draft.species} · {draft.situation ? situationLabel[draft.situation] : ''}</Label><Note>{draft.description.trim()}</Note><Note>Zaman: {draft.observedAt}</Note><Note>Toplulukta: {publicReport(draft, ownerId).communityLocation} · yaklaşık bölge</Note><Note>Yalnızca oluşturanda: {draft.location.address || 'Cihaz noktası'}{draft.location.coordinates ? ` · ${draft.location.coordinates.latitude.toFixed(4)}, ${draft.location.coordinates.longitude.toFixed(4)}` : ''}</Note><Note>Görünürlük: {[draft.audience.community && 'Topluluk', draft.audience.vets && 'Veterinerler'].filter(Boolean).join(' · ')}</Note><Button label="Düzenle" secondary onPress={() => { setPreview(false); reveal(3); }}/><Button label="Bildirimi yayınla" disabled={busy} onPress={() => void saveLocal()}/></Card> : null}
    {notice ? <Note>{notice}</Note> : null}
    {published.map((item, index) => <Card key={index}><Label>Yerel demo taslağı · {item.pet?.name || item.name || item.species}</Label><Note>{item.status === 'resolved' ? 'Bulundu / çözüldü' : 'Açık · yalnızca bu cihazda'}</Note>{item.status === 'open' && item.ownerId === ownerId ? <Button label="Bulundu / çözüldü" secondary onPress={() => { const next = published.map((row, i) => i === index ? { ...row, status: 'resolved' as const } : row); void AsyncStorage.setItem('petid.local-reports.' + ownerId, JSON.stringify(next)).then(() => setPublished(next)).catch(() => setNotice('Durum kaydedilemedi. Yeniden deneyin.')); }}/> : null}</Card>)}
  </Screen>;
}
function Choice({ label, chosen, onPress, tone, photo, species }: { label: string; chosen: boolean; onPress: () => void; tone?: string; photo?: string; species?: 'Kedi' | 'Köpek' }) {
  const { colors } = useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: chosen }} onPress={onPress} style={{ minHeight: 64, padding: 12, borderRadius: 17, borderWidth: 1.5, borderColor: chosen ? tone || colors.accent : colors.border, backgroundColor: chosen ? colors.purpleSoft : colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12 }}>{species ? <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purpleSoft }}>{photo ? <Image source={{ uri: photo }} style={{ width: 40, height: 40 }}/> : <PetSketch species={species} size={30} color={colors.accent}/>}</View> : null}<Text style={{ color: tone || colors.text, fontFamily: fonts.strong, fontSize: 16, flex: 1 }}>{label}</Text><View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: tone || colors.accent, backgroundColor: chosen ? tone || colors.accent : 'transparent' }}/></Pressable>;
}
function Summary({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const { colors } = useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={label + ' değiştir'} onPress={onPress} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text numberOfLines={1} style={{ color: colors.text, flex: 1, fontFamily: fonts.strong }}>{value}</Text><Text style={{ color: colors.accent, fontFamily: fonts.strong }}>Değiştir</Text></Pressable>;
}
function Toggle({ label, detail, selected, onPress }: { label: string; detail: string; selected: boolean; onPress: () => void }) {
  const { colors } = useApp();
  return <Pressable accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked: selected }} onPress={onPress} style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ width: 23, height: 23, borderRadius: 6, borderWidth: 2, borderColor: colors.accent, backgroundColor: selected ? colors.accent : colors.surface, alignItems: 'center', justifyContent: 'center' }}>{selected ? <Text style={{ color: colors.onAccent }}>✓</Text> : null}</View><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontFamily: fonts.strong }}>{label}</Text><Text style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 12 }}>{detail}</Text></View></Pressable>;
}
function MiniAction({ label, children, onPress, disabled = false }: { label: string; children: string; onPress: () => void; disabled?: boolean }) {
  const { colors } = useApp();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} accessibilityState={{ disabled }} onPress={onPress} style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center', opacity: disabled ? .3 : 1 }}><Text style={{ color: colors.text, fontSize: 23 }}>{children}</Text></Pressable>;
}
