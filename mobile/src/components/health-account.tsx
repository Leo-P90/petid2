import { useEffect, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { Button, Card, Field, Label, Note, Segments } from './ui';
import { createHealthRepository } from '../services/health';
import { supabase } from '../services/supabase';
import { nativeServices } from '../services/native';
import { resultMessage } from '../core/services';
import { healthKinds, type HealthInput, type HealthRecord, type HealthDocument, type HealthKind } from '../core/health';

const repository = createHealthRepository(supabase);
const kindNames = ['Aşı', 'İlaç', 'Kilo', 'Muayene', 'Genel'];
const empty = (kind: HealthKind): HealthInput => ({ kind, title: '', occurred_on: '', due_on: null, notes: null, weight_kg: null });
export function HealthAccount({ ownerId, petId, tab, repo = repository }: { ownerId: string; petId: string; tab: string; repo?: typeof repository }) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [form, setForm] = useState<HealthInput | null>(null);
  const [editId, setEditId] = useState<string>();
  const [weight, setWeight] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const alive = useRef(true); const lock = useRef(false);
  async function reload() {
    const [nextRecords, nextDocuments] = await Promise.all([repo.records(petId), repo.documents(petId)]);
    if (alive.current) { setRecords(nextRecords); setDocuments(nextDocuments); setLoaded(true); }
  }
  useEffect(() => {
    alive.current = true;
    void reload().catch(() => { if (alive.current) setMessage('Sağlık verileri yüklenemedi. Yeniden deneyin.'); });
    return () => { alive.current = false; };
    // The parent keys this component by account + pet, so every scope mounts afresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, petId]);
  async function run(work: () => Promise<void>, success: string) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try { await work(); if (!alive.current) return; await reload(); if (alive.current) setMessage(success); }
    catch (error) { if (alive.current) setMessage(error instanceof Error ? error.message : 'İşlem tamamlanamadı. Yeniden deneyin.'); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  const selectedKind: HealthKind = tab === 'Aşılar' ? 'vaccine' : tab === 'İlaçlar' ? 'medication' : tab === 'Kilo' ? 'weight' : 'general';
  const visible = tab === 'Geçmiş' ? records : records.filter((record) => record.kind === selectedKind);
  return <>
    <Card><Label heading>{tab}</Label>
      {!loaded ? <Note>Sağlık verileri yükleniyor.</Note> : !visible.length ? <Note>Bu hayvan için henüz kayıt yok.</Note> : null}
      {visible.map((record) => <View key={record.id} style={{ gap: 8 }}>
        <Label>{record.title}</Label><Note>{record.occurred_on}{record.weight_kg !== null ? ` · ${record.weight_kg} kg` : ''}{record.due_on ? ` · Sonraki: ${record.due_on}` : ''}</Note>
        {record.notes ? <Note>{record.notes}</Note> : null}
        <Button label={`${record.title} düzenle`} secondary disabled={busy} onPress={() => { setForm(record); setEditId(record.id); setWeight(record.weight_kg?.toString() ?? ''); }} />
        <Button label={`${record.title} sil`} secondary disabled={busy} onPress={() => void run(() => repo.remove(petId, record.id), 'Kayıt silindi. Belgeler sağlık arşivinde korundu.')} />
      </View>)}
      <Button label="Sağlık kaydı ekle" disabled={busy} onPress={() => { setForm(empty(selectedKind)); setEditId(undefined); setWeight(''); }} />
    </Card>
    {form ? <Card><Label heading>{editId ? 'Kaydı düzenle' : 'Yeni sağlık kaydı'}</Label>
      <Segments labels={kindNames} selected={kindNames[healthKinds.indexOf(form.kind)]} onSelect={(name) => { if (!busy) setForm({ ...form, kind: healthKinds[kindNames.indexOf(name)] }); }} />
      <Field label="Başlık" value={form.title} editable={!busy} maxLength={120} onChangeText={(title) => setForm({ ...form, title })} />
      <Field label="Kayıt tarihi (YYYY-AA-GG)" value={form.occurred_on} editable={!busy} onChangeText={(occurred_on) => setForm({ ...form, occurred_on })} />
      <Field label="Sonraki tarih (isteğe bağlı)" value={form.due_on ?? ''} editable={!busy} onChangeText={(value) => setForm({ ...form, due_on: value || null })} />
      {form.kind === 'weight' ? <Field label="Kilo (kg)" keyboardType="decimal-pad" value={weight} editable={!busy} onChangeText={setWeight} /> : null}
      <Field label="Not" multiline maxLength={5000} value={form.notes ?? ''} editable={!busy} onChangeText={(notes) => setForm({ ...form, notes })} />
      <Button label="Kaydı kaydet" disabled={busy} onPress={() => void run(async () => {
        await repo.save(ownerId, petId, { kind: form.kind, title: form.title, occurred_on: form.occurred_on, due_on: form.due_on, notes: form.notes, weight_kg: form.kind === 'weight' ? Number(weight.replace(',', '.')) : null }, editId);
        if (alive.current) { setForm(null); setEditId(undefined); }
      }, 'Kayıt kaydedildi.')} />
      <Button label="Vazgeç" secondary disabled={busy} onPress={() => setForm(null)} />
    </Card> : null}
    <Card><Label heading>Sağlık belgeleri</Label><Note>Özel arşiv · PDF, JPEG, PNG, WebP · En fazla 10 MB</Note>
      <Button label="Cihazdan belge yükle" disabled={busy} onPress={() => void run(async () => {
        const result = await nativeServices.pickFile();
        if (!alive.current) return;
        if (result.status !== 'success') throw new Error(resultMessage(result));
        await repo.upload(ownerId, petId, result.value);
      }, 'Belge özel arşive yüklendi.')} />
      {documents.map((attachment) => <View key={attachment.id} style={{ gap: 8 }}><Label>{attachment.file_name}</Label>
        <Button label={`${attachment.file_name} aç`} secondary disabled={busy} onPress={() => void run(async () => { const url = await repo.signedUrl(attachment.storage_path); if (alive.current) await Linking.openURL(url); }, '')} />
        <Button label={`${attachment.file_name} sil`} secondary disabled={busy} onPress={() => void run(() => repo.removeDocument(attachment), 'Belge silindi.')} />
      </View>)}
    </Card>
    {message ? <Note>{message}</Note> : null}
    <Button label="Sağlık verilerini yenile" secondary disabled={busy} onPress={() => void run(async () => undefined, '')} />
  </>;
}

