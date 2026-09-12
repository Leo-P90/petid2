import { useState } from 'react';
import { Button, Card, Field, Label, Note, Screen } from '../components/ui';
import { nativeServices } from '../services/native';
import { resultMessage } from '../core/services';
export default function Emergency() {
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function contact(kind: 'tel' | 'whatsapp') {
    setBusy(true); setMessage(resultMessage(await nativeServices.contact(kind, number))); setBusy(false);
  }
  return <Screen title="Acil veteriner">
    <Card><Label heading>Doğrulanmış klinik listesi henüz bağlı değil</Label>
      <Note>Burada canlı, açık veya nöbetçi olduğu iddia edilen örnek klinik yok. Acil durumda kendi veterinerinizin bilgilerini doğrulayın.</Note>
    </Card>
    <Card><Label heading>Kendi doğruladığın numarayı aç</Label><Note>Ülke kodu dahil yazın. Dış uygulama açılır; arama veya mesaj otomatik gönderilmez.</Note>
      <Field label="Veteriner telefon numarası" keyboardType="phone-pad" value={number} onChangeText={setNumber} placeholder="+90…" maxLength={25} />
      <Button label="Telefon uygulamasında aç" disabled={busy || !number.trim()} onPress={() => void contact('tel')} />
      <Button secondary label="WhatsApp bağlantısını aç" disabled={busy || !number.trim()} onPress={() => void contact('whatsapp')} />
      {message ? <Note>{message}</Note> : null}
    </Card>
  </Screen>;
}
