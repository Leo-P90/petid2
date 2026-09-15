import { Image } from 'expo-image';

// Local line artwork avoids Android's unsupported SVG data URI rendering.
export function PetSketch({ species = 'Kedi', size = 64, color = '#8B7CF6' }: { species?: string; size?: number; color?: string }) {
  return <Image testID="pet-sketch" accessibilityLabel={species + ' çizgisel avatarı'} source={species === 'Köpek' ? require('../../assets/images/sketch-dog.png') : require('../../assets/images/sketch-cat.png')} tintColor={color} contentFit="contain" style={{ width: size, height: size }} />;
}
