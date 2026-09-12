import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Label, Note, Screen } from '../../components/ui';
import { adoptionListings } from '../../core/model';
export function generateStaticParams() {
  return adoptionListings.map((listing) => ({ id: listing.id }));
}
export default function AdoptionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = adoptionListings.find((item) => item.id === id);
  return <Screen title="Sahiplendirme detayı"><Card>
    {listing ? <><Label heading>{listing.name}</Label><Note>{listing.species}</Note><Note>{listing.note}</Note>
      <Note>Başvuru ve sahip iletişimi kapalıdır; gerçek bir kişiyle iletişim kurulmaz.</Note></> : <Note>İlan bulunamadı.</Note>}
    <Button secondary label="Sahiplendirme listesine dön" onPress={() => router.replace('/adoption')} />
  </Card></Screen>;
}
