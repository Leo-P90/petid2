import { Text, View } from 'react-native';
import { Card, Label, Note, RouteButton, Screen } from '../../components/ui';
import { adoptionListings } from '../../core/model';
import { useApp } from '../../state/app-state';
export default function Adoption() {
  const { colors } = useApp();
  return <Screen title="Sahiplendirme"><Note>Örnek kartlar · Gerçek ilan veya başvuru yok.</Note>
    {adoptionListings.map((listing, index) => <Card key={listing.id}><View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}><View style={{ width: 88, height: 88, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: index ? colors.amberSoft : colors.greenSoft }}><Text accessibilityLabel="Örnek hayvan görseli" style={{ fontSize: 46 }}>{listing.species === 'Kedi' ? '🐱' : '🐶'}</Text></View><View style={{ flex: 1, gap: 4 }}><Label heading>{listing.name}</Label><View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: colors.blueSoft }}><Note>{listing.species} · DEMO</Note></View><Note>{listing.note}</Note></View></View>
      <RouteButton label={listing.name + ' örnek detayını aç'} href={{ pathname: '/adoption/[id]', params: { id: listing.id } }} />
    </Card>)}
    <Card><Label>İlan oluşturma ve sahiplik</Label><Note>Fotoğraflı gerçek ilan oluşturma/düzenleme, başvuru, kapatma ve şikayet backend diliminde uygulanacak. Sahip yetkileri olmadan yayın yapılmaz.</Note></Card>
  </Screen>;
}

