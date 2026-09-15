import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Keyboard, Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Field, Label, Note, MatchScreen, PetSelector, Screen, Segments, useSectionColors } from './ui';
import { MatchEmpty } from './match-empty';
import { KeyboardScreen } from './keyboard-screen';
import { createMatchRepository, secureRequestId } from '../services/match';
import { supabase } from '../services/supabase';
import { nativeServices } from '../services/native';
import { resultMessage } from '../core/services';
import { matchMessage, unread, type MatchProfileInput, type MatchSnapshot } from '../core/match-live';
import type { Pet } from '../core/model';
import type { Candidate } from '../core/match-model';
const repository = createMatchRepository(supabase);
const empty: MatchSnapshot = { profile: null, candidates: [], threads: [], media: [] };
function LivePhoto({ petId, repo, children }: { petId: string; repo: typeof repository; children: (uri?: string) => ReactNode }) {
  const [uri, setUri] = useState('');
  useEffect(() => {
    let alive = true; let dispose: (() => void) | undefined;
    void repo.photo(petId).then(result => { if (!alive) { result?.dispose(); return; } dispose = result?.dispose; setUri(result?.uri ?? ''); }).catch(() => undefined);
    return () => { alive = false; dispose?.(); };
  }, [petId, repo]);
  return children(uri || undefined);
}
export function MatchAccount({ ownerId, pet, renderCandidate, repo = repository }: {
  ownerId: string; pet: Pet; repo?: typeof repository;
  renderCandidate: (candidate: Candidate, choose: (like: boolean) => void, key: string, actions: { undo: () => void; canUndo: boolean; info: () => void }) => ReactNode;
}) {
  const colors = useSectionColors('match');
  const [snapshot, setSnapshot] = useState(empty); const [loaded, setLoaded] = useState(false);
  const [section, setSection] = useState('Keşfet'); const [settings, setSettings] = useState(false);
  const [information, setInformation] = useState(false); const [passed, setPassed] = useState<string[]>([]);
  const [form, setForm] = useState<MatchProfileInput | null>(null);
  const [excluded, setExcluded] = useState<string[]>([]); const [nonce, setNonce] = useState(0);
  const [active, setActive] = useState<string | null>(null); const [text, setText] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const [reportTarget, setReportTarget] = useState<string | null>(null); const [reason, setReason] = useState('spam'); const [description, setDescription] = useState('');
  const alive = useRef(true); const lock = useRef(false); const generation = useRef(0); const compose = useRef<View>(null);
  // Retain request ID on uncertain send failures; retries cannot duplicate a message.
  const pendingSend = useRef<{ c: string; body: string; id: string } | null>(null);
  const load = useCallback(async () => {
    const version = ++generation.current;
    const next = await repo.snapshot(pet.id);
    if (alive.current && version === generation.current) { setSnapshot(next); setLoaded(true); }
  }, [repo, pet.id]);
  useEffect(() => {
    alive.current = true;
    const refresh = async () => {
      if (lock.current) return;
      lock.current = true;
      try { await load(); }
      catch { if (alive.current) { setSnapshot(empty); setMessage('PatiMatch yüklenemedi. Bağlantıyı kontrol edip yeniden deneyin.'); } }
      finally { lock.current = false; }
    };
    void refresh();
    const timer = setInterval(() => { if (AppState.currentState === 'active') void refresh(); }, 5000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); });
    return () => { alive.current = false; clearInterval(timer); listener.remove(); Keyboard.dismiss(); };
  }, [load]);
  async function run(work: () => Promise<void>, success = '') {
    if (lock.current) { setNonce(n => n + 1); setMessage('Yenileme sürüyor; tekrar deneyin.'); return; }
    lock.current = true; setBusy(true); setMessage('');
    try { await work(); if (!alive.current) return; await load(); if (alive.current) setMessage(success); }
    catch { if (alive.current) { setMessage('İşlem tamamlanamadı. Bağlantı veya erişim durumunu kontrol edip tekrar deneyin.'); setNonce(n => n + 1); } }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  const candidate = snapshot.candidates.find(row => !excluded.includes(row.pet_id));
  const thread = snapshot.threads.find(row => row.id === active);
  function edit() {
    setForm(snapshot.profile ?? { display_name: pet.name, birth_date: null, age_label: pet.age, breed: '', sex: 'Belirtilmedi', bio: '', city: '', district: '', active: false }); setSettings(true);
  }
  function open(id: string) { setActive(id); setText(''); pendingSend.current = null; }
  useEffect(() => {
    if (!thread?.messages.length) return;
    const last = thread.messages.at(-1)!;
    if (thread.reads.find(row => row.pet_id === pet.id)?.last_message_id === last.id) return;
    let mounted = true;
    void repo.read(thread.id, pet.id, last.id).catch(() => { if (mounted) setMessage('Okundu bilgisi kaydedilemedi; yeniden deneyin.'); });
    return () => { mounted = false; };
  }, [thread, pet.id, repo]);
  function choose(like: boolean) {
    if (!candidate || !snapshot.profile || busy) return;
    if (lock.current) { setNonce(n => n + 1); setMessage('Yenileme sürüyor; tekrar deneyin.'); return; }
    if (!like) { setExcluded(rows => [...rows, candidate.pet_id]); setPassed(rows => [...rows, candidate.pet_id]); return; }
    void run(async () => {
      const id = await repo.like(snapshot.profile!, candidate);
      if (alive.current) { setExcluded(rows => [...rows, candidate.pet_id]); if (id) { setMessage('Karşılıklı eşleşme!'); open(id); } }
    }, 'Beğeni kaydedildi.');
  }
  const card: Candidate | null = candidate ? { id: candidate.pet_id, species: candidate.species, name: candidate.display_name, age: candidate.age_label ?? 'Yaş belirtilmedi', breed: candidate.breed || 'Irk belirtilmedi', gender: candidate.sex, distance: [candidate.city, candidate.district].filter(Boolean).join(' / ') || 'Konum belirtilmedi', bio: candidate.bio, compatibility: 0, mutual: false, opener: '', reply: '' } : null;
  function undo() { const last = passed.at(-1); if (!last || busy) return; setExcluded(rows => rows.filter(id => id !== last)); setPassed(rows => rows.slice(0, -1)); setNonce(n => n + 1); }
  return <MatchScreen section={section} onSection={setSection} onSettings={edit}>
    {section === 'Keşfet' && (!loaded || !snapshot.profile?.active) ? <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 16 }}><Label heading>{!loaded ? 'Patiler hazırlanıyor…' : 'Bir merhabaya hazır mısınız?'}</Label>{loaded ? <Button label="Paylaşım tercihlerini aç" onPress={edit} /> : null}</View> : null}
    {section === 'Keşfet' && snapshot.profile?.active ? card ? <LivePhoto key={candidate!.pet_id} petId={candidate!.pet_id} repo={repo}>{uri => renderCandidate({ ...card, photo: uri }, like => choose(like), `${pet.id}/${card.id}/${nonce}`, { undo, canUndo: passed.length > 0, info: () => setInformation(true) })}</LivePhoto> : <MatchEmpty species={pet.species} disabled={busy} onDiscover={() => { setExcluded([]); setPassed([]); void run(async () => undefined); }} /> : null}
    {section === 'Mesajlar' ? <ScrollView contentContainerStyle={{ gap: 14, padding: 8 }}><Label heading>Mesajlar</Label>{snapshot.threads.length ? snapshot.threads.map(row => <Card key={row.id}><Button label={`${row.candidate.display_name}${unread(row, pet.id) ? ' · okunmamış' : ''}`} secondary onPress={() => open(row.id)} /><Text numberOfLines={1} style={{ color: colors.muted }}>{row.messages.at(-1)?.body || 'İlk merhabayı sen söyle.'}</Text></Card>) : <Note>İlk karşılıklı eşleşmen burada olacak.</Note>}</ScrollView> : null}
    {message ? <Note>{message}</Note> : null}
    {message.includes('yüklenemedi') || message.includes('tamamlanamadı') ? <Button label="PatiMatch yenile / tekrar dene" secondary disabled={busy} onPress={() => void run(async () => undefined)} /> : null}
    <Modal visible={settings} onRequestClose={() => { Keyboard.dismiss(); setSettings(false); }}><Screen title="PatiMatch ayarları" tone="match"><Button label="Ayarları kapat" secondary onPress={() => { Keyboard.dismiss(); setSettings(false); }} /><PetSelector disabled={busy} /><Note>Kendi profil onayınız: {snapshot.ownVerification ?? 'Onaylanmadı'} · Sağlık/veteriner doğrulaması değildir.</Note>
    {settings && form ? <Card><Label heading>Paylaşılabilir PatiMatch profili</Label><Note>Bu alanlar ve burada seçtiğiniz fotoğraflar uygun adaylara açılır. Kesin GPS, sağlık dosyaları veya özel galeriniz paylaşılmaz.</Note>
      <Field label="Görünen ad" value={form.display_name} maxLength={50} onChangeText={display_name => setForm({ ...form, display_name })} />
      <Field label="Yaş bilgisi" value={form.age_label ?? ''} maxLength={40} onChangeText={age_label => setForm({ ...form, age_label })} />
      <Field label="Irk" value={form.breed} maxLength={80} onChangeText={breed => setForm({ ...form, breed })} />
      <Segments labels={['Dişi', 'Erkek', 'Belirtilmedi']} selected={form.sex} onSelect={sex => setForm({ ...form, sex: sex as MatchProfileInput['sex'] })} />
      <Field label="Hakkında" value={form.bio} multiline maxLength={500} onChangeText={bio => setForm({ ...form, bio })} />
      <Field label="İl" value={form.city} maxLength={80} onChangeText={city => setForm({ ...form, city })} />
      <Field label="İlçe" value={form.district} maxLength={80} onChangeText={district => setForm({ ...form, district })} />
      <Button label={form.active ? 'Keşif açık · kapat' : 'Keşif kapalı · aç'} secondary disabled={busy} onPress={() => setForm({ ...form, active: !form.active })} />
      <Button label="Paylaşım ayarlarını kaydet" disabled={busy || !pet.id} onPress={() => void run(async () => { await repo.saveProfile(ownerId, pet, form); if (alive.current) setSettings(false); }, 'PatiMatch profili kaydedildi.')} />
    </Card> : null}
    {settings && snapshot.profile ? <Card><Label heading>Yalnız PatiMatch için fotoğraflar</Label><Button label="PatiMatch fotoğrafı seç ve paylaş" disabled={busy} onPress={() => void run(async () => { const result = await nativeServices.pickPhotos(); if (result.status !== 'success') { if (alive.current) setMessage(resultMessage(result)); return; } for (const uri of result.value) { if (!alive.current) return; await repo.upload(pet.id, uri); } }, 'Seçilen fotoğraflar PatiMatch için paylaşıldı.')} />
      {snapshot.media.map((media, index) => <Button key={media.id} label={`Paylaşılan fotoğraf ${index + 1} sil`} secondary disabled={busy} onPress={() => void run(() => repo.removeMedia(media), 'Paylaşılan fotoğraf silindi.')} />)}
    </Card> : null}
    {message ? <Note>{message}</Note> : null}</Screen></Modal>
    <Modal visible={information && !!card} onRequestClose={() => setInformation(false)}><Screen title="Patini tanı" tone="match"><Button label="Bilgiyi kapat" secondary onPress={() => setInformation(false)} /><Label heading>{card?.name}</Label><Note>{card?.bio}</Note><Note>Profil onayı sağlık veya veteriner doğrulaması değildir.</Note><Button label="Adayı engelle" secondary disabled={busy} onPress={() => { if (card) void run(async () => { await repo.block(pet.id, card.id); if (alive.current) setInformation(false); }, 'Engellendi.'); }} /><Button label="Adayı şikâyet et" secondary onPress={() => { if (card) { setInformation(false); setReportTarget(card.id); setDescription(''); } }} /></Screen></Modal>
    <Modal visible={!!reportTarget} onRequestClose={() => setReportTarget(null)}><Screen title="Şikâyet" tone="match">
    {reportTarget ? <Card><Label heading>Özel şikâyet</Label><Segments labels={['spam', 'harassment', 'unsafe', 'other']} selected={reason} onSelect={setReason} /><Field label="Kısa açıklama (isteğe bağlı)" value={description} maxLength={500} multiline onChangeText={setDescription} />
      <Button label="Şikâyeti gönder" disabled={busy} onPress={() => void run(async () => { await repo.report(reportTarget, reason as 'spam' | 'harassment' | 'unsafe' | 'other', description); if (alive.current) setReportTarget(null); }, 'Şikâyet kaydedildi; karşı tarafa gösterilmez.')} /><Button label="Şikâyetten vazgeç" secondary onPress={() => setReportTarget(null)} />
    </Card> : null}
    {message ? <Note>{message}</Note> : null}</Screen></Modal>
    <Modal visible={!!thread} onRequestClose={() => { Keyboard.dismiss(); setActive(null); }}><SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><View style={{ flex: 1 }}>
      <View style={{ padding: 18, gap: 12 }}><Button label="Konuşmayı kapat" secondary onPress={() => { Keyboard.dismiss(); setActive(null); }} /><Label heading>{thread?.candidate.display_name}</Label>
        <Note>Profil onayı: {thread?.verification ?? 'Onaylanmadı'} · Sağlık veya veteriner doğrulaması değildir.</Note></View>
      <KeyboardScreen followEnd>{thread?.messages.map(row => <View key={row.id} style={{ alignSelf: row.sender_pet === pet.id ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: 12, borderRadius: 18, backgroundColor: row.sender_pet === pet.id ? colors.greenSoft : colors.surface }}><Text style={{ color: colors.text, fontSize: 16 }}>{row.body}</Text></View>)}
        <Note>{thread?.reads.some(row => row.pet_id !== pet.id && row.last_message_id === thread.messages.at(-1)?.id) ? 'Son mesaj okundu.' : 'Son mesaj henüz okunmadı.'}</Note>
        <View ref={compose} style={{ gap: 12 }}><Field label="Mesaj" focusArea={compose} value={text} multiline maxLength={1000} onChangeText={setText} />
          <Button label="Mesaj gönder" disabled={busy || !text.trim() || [...text.trim()].length > 500} onPress={() => { if (!thread) return; void run(async () => { const body = matchMessage(text); if (pendingSend.current?.c !== thread.id || pendingSend.current.body !== body) pendingSend.current = { c: thread.id, body, id: secureRequestId() }; await repo.send(thread.id, pet.id, body, pendingSend.current.id); if (alive.current) { setText(''); pendingSend.current = null; } }); }} />
        </View>{message ? <Note>{message}</Note> : null}
        <Button label="Eşleşmeyi kaldır" secondary disabled={busy} onPress={() => { if (thread) void run(async () => { await repo.unmatch(thread.id, pet.id); if (alive.current) setActive(null); }); }} />
        <Button label="Sahibi engelle" secondary disabled={busy} onPress={() => { if (thread) void run(async () => { await repo.block(pet.id, thread.candidate.pet_id); if (alive.current) setActive(null); }); }} />
        <Button label="Sohbeti şikâyet et" secondary onPress={() => { if (thread) { setReportTarget(thread.candidate.pet_id); setDescription(''); setActive(null); } }} />
      </KeyboardScreen></View></SafeAreaView></Modal>
  </MatchScreen>;
}
