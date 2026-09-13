import { useState } from 'react';
import { Text, View } from 'react-native';
import { Card, Label, Note, RouteButton, Screen, Segments, useSectionColors } from '../../components/ui';
import { adoptionListings } from '../../core/model';
export default function Adoption() {
  const colors = useSectionColors('adoption'); const [filter, setFilter] = useState('Hepsi');
  return <Screen title="Sahiplendirme" tone="adoption"><Text style={{ color: colors.accent, fontSize: 11, letterSpacing: 1.4 }}>BİR YUVA, BİR HAYAT</Text><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 30, lineHeight: 36, fontWeight: '800' }}>Belki de birbirinizi arıyorsunuz.</Text><Note>Örnek kartlar · Gerçek ilan veya başvuru yok.</Note><Segments labels={['Hepsi', 'Kediler', 'Köpekler']} selected={filter} onSelect={setFilter} />
    {adoptionListings.filter(listing => filter === 'Hepsi' || listing.species === (filter === 'Kediler' ? 'Kedi' : 'Köpek')).map((listing) => <Card key={listing.id}><View style={{ height: 167, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSoft }}><Text accessibilityLabel="Örnek hayvan görseli" style={{ fontSize: 100 }}>{listing.species === 'Kedi' ? '🐱' : '🐶'}</Text></View><Label heading>{listing.name}</Label><Note>{listing.species} · DEMO</Note><Note>{listing.note}</Note>
      <RouteButton label={listing.name + ' örnek detayını aç'} href={{ pathname: '/adoption/[id]', params: { id: listing.id } }} />
    </Card>)}
    <Card><Label>İlan oluşturma ve sahiplik</Label><Note>Fotoğraflı gerçek ilan oluşturma/düzenleme, başvuru, kapatma ve şikayet backend diliminde uygulanacak. Sahip yetkileri olmadan yayın yapılmaz.</Note></Card>
  </Screen>;
}

