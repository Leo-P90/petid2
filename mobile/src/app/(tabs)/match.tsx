import { useState } from 'react';
import { Button, Card, Label, Note, Screen, RouteButton } from '../../components/ui';
import { discover } from '../../core/model';
import { useApp } from '../../state/app-state';
export default function Match() {
  const { pet } = useApp();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [excluded, setExcluded] = useState<Record<string, string[]>>({});
  const [notices, setNotices] = useState<Record<string, string>>({});
  const participating = preferences[pet.id] ?? false;
  const candidate = discover(pet.species, excluded[pet.id] ?? [])[0];
  function choose(like: boolean) {
    if (!candidate) return;
    setExcluded((previous) => ({ ...previous, [pet.id]: [...(previous[pet.id] ?? []), candidate.id] }));
    setNotices((previous) => ({ ...previous, [pet.id]: like ? 'Demo beğeni kaydedildi. Karşılıklı eşleşme veya mesaj oluşturulmadı.' : 'Demo aday geçildi.' }));
  }
  return <Screen title="PatiMatch" tab>
    <Card><Label heading>{pet.name} için aynı tür keşif</Label><Note>Demo adaylar · Gerçek kişiler, eşleşmeler veya mesajlar yok.</Note>
      <RouteButton label="Hayvan değiştir" href="/profile" />
      <Button label={participating ? 'Demo keşfine katılımı kapat' : 'Demo keşfine katıl'} onPress={() => setPreferences((previous) => ({ ...previous, [pet.id]: !participating }))} />
    </Card>
    {participating ? <Card>{candidate ? <><Label heading>{candidate.name}</Label><Note>{candidate.species} · {candidate.age}</Note><Note>{candidate.note}</Note>
      <Button label="Beğen · demo" onPress={() => choose(true)} /><Button label="Geç" secondary onPress={() => choose(false)} /></> : <><Note>Bu hayvan için demo adaylar bitti.</Note><Button secondary label="Demo keşfini sıfırla" onPress={() => setExcluded((previous) => ({ ...previous, [pet.id]: [] }))} /></>}</Card> : null}
    {notices[pet.id] ? <Note>{notices[pet.id]}</Note> : null}
    <Card><Label>Gizlilik ve güvenlik</Label><Note>Karşılıklı eşleşme, mesajlaşma, engelleme ve şikayet sunucu tarafında uygulanmadan kullanıma açılmaz. Sağlık veya sahip iletişimi paylaşılmaz.</Note><RouteButton label="Sahiplendirmeyi aç" href="/adoption" /></Card>
  </Screen>;
}
