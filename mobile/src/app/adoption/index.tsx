import { Card, Label, Note, RouteButton, Screen } from '../../components/ui';
import { adoptionListings } from '../../core/model';
export default function Adoption() {
  return <Screen title="Sahiplendirme"><Note>Örnek kartlar · Gerçek ilan veya başvuru yok.</Note>
    {adoptionListings.map((listing) => <Card key={listing.id}><Label heading>{listing.name}</Label><Note>{listing.species}</Note><Note>{listing.note}</Note>
      <RouteButton label={listing.name + ' örnek detayını aç'} href={{ pathname: '/adoption/[id]', params: { id: listing.id } }} />
    </Card>)}
    <Card><Label>İlan oluşturma ve sahiplik</Label><Note>Fotoğraflı gerçek ilan oluşturma/düzenleme, başvuru, kapatma ve şikayet backend diliminde uygulanacak. Sahip yetkileri olmadan yayın yapılmaz.</Note></Card>
  </Screen>;
}
