import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useApp } from '../state/app-state';
import { PetPortrait, PetSelector, Screen, Button } from './ui';
import { BrandIcon, ScriptLine, fonts } from './brand';
export function PetBand({ forHealth = false }: { forHealth?: boolean }) {
  const { pet, accountMode, colors } = useApp(); const [open, setOpen] = useState(false);
  const tags = accountMode ? [pet.species] : pet.species === 'Kedi' ? ['Meraklı · örnek', 'Sosyal · örnek'] : ['Neşeli · örnek', 'Sosyal · örnek'];
  return <><Pressable testID="selected-pet-band" accessibilityRole="button" accessibilityLabel={pet.name + ' · hayvan değiştir'} onPress={() => setOpen(true)} style={{ minHeight: forHealth ? 92 : 100, borderRadius: 22, backgroundColor: colors.purpleSoft, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E7DEF7' }}>
    <PetPortrait key={pet.id + pet.photos[0]} size={forHealth ? 64 : 68}/><View style={{ flex: 1, gap: 3 }}><Text style={{ color: colors.text, fontFamily: fonts.display, fontSize: forHealth ? 20 : 24 }}>{pet.name}</Text><Text numberOfLines={1} style={{ color: colors.text, fontFamily: fonts.body, fontSize: 13 }}>{pet.age} · {pet.species}</Text><View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>{tags.slice(0, forHealth ? 1 : 2).map(tag => <Text key={tag} style={{ borderRadius: 12, overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 2, backgroundColor: '#E4F5ED', color: '#0B8560', fontFamily: fonts.strong, fontSize: 10 }}>{tag}</Text>)}</View></View><View style={{ alignItems: 'flex-end', maxWidth: 76 }}><ScriptLine color="#51427C" size={forHealth ? 15 : 17}>İyi kal, mutlu kal</ScriptLine><BrandIcon name="chevron" color={colors.accent} size={17}/></View>
  </Pressable><Modal visible={open} onRequestClose={() => setOpen(false)}><Screen title="Dostunu seç"><Button label="Seçimi kapat" secondary onPress={() => setOpen(false)}/><PetSelector/></Screen></Modal></>;
}
