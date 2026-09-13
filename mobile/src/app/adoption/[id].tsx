import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Card, Label, Note, Screen, useSectionColors } from '../../components/ui';
import { adoptionListings } from '../../core/model';
export function generateStaticParams() {
  return adoptionListings.map((listing) => ({ id: listing.id }));
}
export default function AdoptionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = adoptionListings.find((item) => item.id === id);
  const colors = useSectionColors('adoption');
  return <Screen title="Yeni bir başlangıç" tone="adoption"><Card>
    {listing ? <><View style={{ height: 220, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSoft }}><Text accessibilityLabel="Temsili ilan görseli" style={{ fontSize: 110 }}>{listing.species === 'Kedi' ? '🐱' : '🐶'}</Text></View><Note>ÖRNEK SAHİPLENDİRME İLANI</Note><Label heading>Merhaba, ben {listing.name}.</Label><Note>{listing.species}</Note><Label>Benim hikâyem</Label><Note>{listing.note}</Note>
      <Note>Başvuru ve sahip iletişimi kapalıdır; gerçek bir kişiyle iletişim kurulmaz.</Note></> : <Note>İlan bulunamadı.</Note>}
    <Button secondary label="Sahiplendirme listesine dön" onPress={() => router.replace('/adoption')} />
  </Card></Screen>;
}
