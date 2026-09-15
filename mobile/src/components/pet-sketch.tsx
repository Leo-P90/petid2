import Svg, { Path } from 'react-native-svg';
// Original local vector line art, deliberately simple at avatar sizes.
export function PetSketch({ species = 'Kedi', size = 64, color = '#8B7CF6' }: { species?: string; size?: number; color?: string }) {
  const outline = species === 'Köpek'
    ? 'M27 38C10 21 8 54 19 64L29 52M69 38C86 21 88 54 77 64L67 52M28 35C33 24 63 24 68 35L70 61C70 80 26 80 26 61Z'
    : 'M25 43L21 18L40 30Q48 26 56 30L75 18L71 43Q78 73 48 77Q18 73 25 43ZM18 55L33 58M18 65L33 63M63 58L78 55M63 63L78 65';
  return <Svg testID="pet-sketch" accessibilityLabel={species + ' çizgisel avatarı'} width={size} height={size} viewBox="0 0 96 96"><Path d={outline} stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><Path d="M35 47Q38 43 41 47M55 47Q58 43 61 47M44 56L48 59L52 56ZM48 59V64M48 64Q43 69 39 65M48 64Q53 69 57 65" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></Svg>;
}
