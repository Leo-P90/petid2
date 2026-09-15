import { Image, View } from 'react-native';
import type { adoptionListings } from '../core/model';

type Listing = (typeof adoptionListings)[number];
const photos = {
  pamuk: require('../../assets/images/adoption-pamuk-r3.png'),
  zeytin: require('../../assets/images/adoption-zeytin-r3.png'),
} as const;

export function AdoptionPhoto({ listing, size = 80 }: { listing: Listing; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F1EAFB' }}>
    <Image accessibilityLabel={listing.name + ' örnek fotoğrafı'} source={photos[listing.photoKey as keyof typeof photos]} resizeMode="cover" style={{ width: '100%', height: '100%' }}/>
  </View>;
}
