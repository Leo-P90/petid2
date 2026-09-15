import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Linking, Platform } from 'react-native';
import { Button, Card, Field, Label, Note, Screen } from '../components/ui';
import { nativeServices } from '../services/native';
import { resultMessage, type Coordinates } from '../core/services';
export default function Emergency() {
  const { from } = useLocalSearchParams<{ from?: string }>(); const requested = useRef(false);
  const [number, setNumber] = useState('');
  const [address, setAddress] = useState(''); const [position, setPosition] = useState<Coordinates | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function locate() {
    setBusy(true); const result = await nativeServices.locate();
    if (result.status === 'success') { setPosition(result.value); setMessage('Konum alındı. Kliniklerin açık olma durumunu haritada veya telefonla doğrulayın.'); }
    else setMessage(resultMessage(result) + ' Adres veya semti elle girebilirsiniz.');
    setBusy(false);
  }
  useEffect(() => { if (from === 'home' && !requested.current) { requested.current = true; void locate(); } }, [from]);
  async function searchMap() {
    const query = encodeURIComponent((address.trim() ? address.trim() + ' ' : '') + 'veteriner kliniği');
    const url = Platform.OS === 'android' ? `geo:${position?.latitude ?? 0},${position?.longitude ?? 0}?q=${query}` : `https://www.google.com/maps/search/?api=1&query=${query}`;
    try { await Linking.openURL(url); setMessage('Harita araması açıldı. Açık saatleri ve iletişim bilgisini doğrulayın.'); }
    catch { setMessage('Harita açılamadı. Adresi elle arayabilir veya doğruladığınız veterineri telefonla arayabilirsiniz.'); }
  }
  async function contact(kind: 'tel' | 'whatsapp') {
    setBusy(true); setMessage(resultMessage(await nativeServices.contact(kind, number))); setBusy(false);
  }
  return <Screen title="Acil veteriner">
    <Card><Label heading>Yakında veteriner ara</Label>
      <Note>Harita araması öneri gösterir; açık veya nöbetçi bilgisi PetID tarafından doğrulanmaz. Gitmeden önce kliniği arayın.</Note>
      <Button label="Cihaz konumumu kullan" disabled={busy} onPress={() => void locate()} />
      <Field label="Adres / semt (elle giriş)" value={address} onChangeText={setAddress} placeholder="Örn. Kadıköy veya yakın sokak" maxLength={160} />
      {position ? <Note>Seçilen konum: {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}</Note> : null}
      <Button label="Haritada veteriner ara" secondary disabled={busy || (!position && !address.trim())} onPress={() => void searchMap()} />
      {message ? <Note>{message}</Note> : null}
    </Card>
    <Card><Label heading>Kendi doğruladığın numarayı aç</Label><Note>Ülke kodu dahil yazın. Dış uygulama açılır; arama veya mesaj otomatik gönderilmez.</Note>
      <Field label="Veteriner telefon numarası" keyboardType="phone-pad" value={number} onChangeText={setNumber} placeholder="+90…" maxLength={25} />
      <Button label="Telefon uygulamasında aç" disabled={busy || !number.trim()} onPress={() => void contact('tel')} />
      <Button secondary label="WhatsApp bağlantısını aç" disabled={busy || !number.trim()} onPress={() => void contact('whatsapp')} />
    </Card>
  </Screen>;
}
