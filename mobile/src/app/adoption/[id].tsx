import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Button, Card, Label, Note, Screen } from '../../components/ui';
import { AdoptionPhoto } from '../../components/adoption-photo';
import { adoptionListings } from '../../core/model';
export function generateStaticParams() {
  return adoptionListings.map((listing) => ({ id: listing.id }));
}
export default function AdoptionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = adoptionListings.find((item) => item.id === id);
  return <Screen title="Yeni bir başlangıç" tone="adoption"><Card>
    {listing ? <><View style={{ alignItems: 'center' }}><AdoptionPhoto listing={listing} size={200}/></View><Note>ÖRNEK SAHİPLENDİRME İLANI</Note><Label heading>Merhaba, ben {listing.name}.</Label><Note>{listing.species} · {listing.age} · {listing.city}</Note><Label>Benim hikâyem</Label><Note>{listing.teaser} {listing.note}</Note>
      <Note>Başvuru ve sahip iletişimi kapalıdır; gerçek bir kişiyle iletişim kurulmaz.</Note></> : <Note>İlan bulunamadı.</Note>}
    <Button secondary label="Sahiplendirme listesine dön" onPress={() => router.replace('/adoption')} />
  </Card></Screen>;
}
