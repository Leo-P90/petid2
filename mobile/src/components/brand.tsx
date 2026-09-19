import Svg, { Circle, Path } from 'react-native-svg';
import { Text, View } from 'react-native';

export const fonts = { display: 'Nunito_800ExtraBold', strong: 'Nunito_700Bold', body: 'Nunito_400Regular', script: 'Caveat_600SemiBold' } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

type Icon = 'paw' | 'heart' | 'home' | 'health' | 'briefcase' | 'search' | 'filter' | 'bell' | 'pin' | 'chevron' | 'person' | 'vaccine' | 'shield' | 'tooth' | 'calendar' | 'info' | 'close' | 'undo' | 'star' | 'sparkle' | 'document' | 'scissors' | 'sun' | 'moon';
const strokes: Record<Exclude<Icon, 'paw' | 'star'>, string> = {
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  home: 'm3 10 9-7 9 7v10H3V10Zm6 10v-7h6v7',
  health: 'M20 12H4m8-8v16',
  briefcase: 'M3 8h18v12H3V8Zm5 0V5h8v3M3 12h18m-11 0v2h4v-2',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5',
  filter: 'M3 6h18M3 12h18M3 18h18',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9ZM10 21h4',
  pin: 'M12 22s7-7.2 7-13a7 7 0 0 0-14 0c0 5.8 7 13 7 13Zm0-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  chevron: 'm9 4 8 8-8 8', person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2',
  vaccine: 'm4 19 4 1 11-11-5-5L3 15l1 4Zm10-15 3-3m0 6 3-3M6 12l6 6',
  shield: 'm12 2 8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Zm-3 10 2 2 4-4',
  tooth: 'M6 3c-3 1-3 5-2 8l2 9c.3 1.5 2 1.5 2.3 0l1-5c.4-2 1-3 2.7-3s2.3 1 2.7 3l1 5c.3 1.5 2 1.5 2.3 0l2-9c1-3 1-7-2-8-2-1-4 1-6 1s-4-2-6-1Z',
  calendar: 'M4 5h16v16H4V5Zm0 5h16M8 3v4m8-4v4',
  info: 'M12 10v7m0-10v.1M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  close: 'M5 5 19 19M19 5 5 19', undo: 'M9 8 4 12l5 4M4 12h10a6 6 0 1 1 0 12',
  sparkle: 'm12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z',
  document: 'M5 2h9l5 5v15H5V2Zm9 0v5h5M8 12h8m-8 4h8',
  scissors: 'M4 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm0 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM8 8l12 12M8 16 20 4',
  sun: 'M12 4v2m0 12v2M4 12h2m12 0h2M6.3 6.3l1.4 1.4m8.6 8.6 1.4 1.4m0-11.4-1.4 1.4M7.7 16.3l-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  moon: 'M19.7 15.2A8.4 8.4 0 0 1 8.8 4.3 8.5 8.5 0 1 0 19.7 15.2ZM19 3v4m-2-2h4',
};
export function BrandIcon({ name, size = 24, color = '#182033', filled = false, testID }: { name: Icon; size?: number; color?: string; filled?: boolean; testID?: string }) {
  return <Svg testID={testID} width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
    {name === 'paw' ? <><Path d="M12 10c-3.4 0-7 3.4-7 6.8C5 19.5 7 21 9.4 21c1.2 0 1.9-.6 2.6-.6s1.4.6 2.6.6c2.4 0 4.4-1.5 4.4-4.2C19 13.4 15.4 10 12 10Z" fill={color}/>{[[5,7],[10,4],[15,4],[20,7]].map(([cx,cy])=><Circle key={cx} cx={cx} cy={cy} r="2" fill={color}/>)}</> : name === 'filter' ? <><Path d={strokes.filter} stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Circle cx={8} cy={6} r={2.2} fill={color}/><Circle cx={16} cy={12} r={2.2} fill={color}/><Circle cx={10} cy={18} r={2.2} fill={color}/></> : name === 'star' ? <Path d="m12 2 3 7 7 .6-5.4 4.7 1.7 7L12 17.5l-6.3 3.8 1.7-7L2 9.6 9 9l3-7Z" fill={color}/> : <Path d={strokes[name]} stroke={color} strokeWidth={name === 'close' ? 2.7 : 1.8} strokeLinecap="round" strokeLinejoin="round" fill={filled ? color : 'none'}/>}
  </Svg>;
}
export function PetIDWordmark({ size = 34, light = false }: { size?: number; light?: boolean }) {
  return <View testID="petid-wordmark" accessibilityLabel="PetID" style={{ flexDirection: 'row', alignItems: 'flex-start' }}><Text style={{ fontFamily: fonts.display, color: light ? '#FFFFFF' : '#182033', fontSize: size, lineHeight: size * 1.13 }}>Pet</Text><Text style={{ fontFamily: fonts.display, color: '#8B7CF6', fontSize: size, lineHeight: size * 1.13 }}>ID</Text><View style={{ marginLeft: 3, marginTop: 1 }}><BrandIcon name="paw" size={size * .42} color={light ? '#B7ACFF' : '#182033'}/></View></View>;
}
export function MatchWordmark() {
  return <View testID="match-wordmark" accessibilityLabel="PatiMatch" style={{ flexDirection: 'row', alignItems: 'baseline' }}><Text style={{ fontFamily: fonts.display, fontSize: 34, color: '#FFFFFF', lineHeight: 39 }}>Pati</Text><Text style={{ fontFamily: fonts.display, fontSize: 34, color: '#B7ACFF', lineHeight: 39 }}>Match</Text></View>;
}
export function ScriptLine({ children, color = '#273153', size = 20 }: { children: React.ReactNode; color?: string; size?: number }) {
  return <Text style={{ fontFamily: fonts.script, color, fontSize: size, lineHeight: size * 1.08 }}>{children}</Text>;
}
