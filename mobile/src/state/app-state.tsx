import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { demoPets, type Pet, type ThemeMode } from '../core/model';
import { palettes, parseTheme, THEME_KEY } from '../core/theme';
type Storage = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;
type State = {
  mode: ThemeMode; colors: typeof palettes.light; ready: boolean; notice: string; themeBusy: boolean;
  toggleTheme: () => Promise<void>; pets: Pet[]; pet: Pet;
  selectPet: (id: string) => void; updatePet: (id: string, changes: Partial<Pet>) => void;
};
const Context = createContext<State | null>(null);
export function AppProvider({ children, storage = AsyncStorage }: { children: ReactNode; storage?: Storage }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [themeBusy, setThemeBusy] = useState(false);
  const themeLock = useRef(false);
  const [pets, setPets] = useState<Pet[]>(() => demoPets.map((pet) => ({ ...pet, photos: [] })));
  const [selected, setSelected] = useState(demoPets[0].id);
  useEffect(() => {
    let active = true;
    storage.getItem(THEME_KEY).then((value) => { if (active) setMode(parseTheme(value)); })
      .catch(() => { if (active) setNotice('Tema okunamadı; açık tema kullanılıyor.'); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [storage]);
  useEffect(() => {
    if (ready && Platform.OS !== 'web') Appearance.setColorScheme(mode);
  }, [ready, mode]);
  async function toggleTheme() {
    if (themeLock.current) return;
    themeLock.current = true;
    setThemeBusy(true);
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    try { await storage.setItem(THEME_KEY, next); setNotice(''); }
    catch { setNotice('Tema bu oturumda değişti fakat cihazda saklanamadı.'); }
    finally { themeLock.current = false; setThemeBusy(false); }
  }
  const pet = pets.find((item) => item.id === selected) ?? pets[0];
  return <Context.Provider value={{
    mode, colors: palettes[mode], ready, notice, themeBusy, toggleTheme, pets, pet,
    selectPet: (id) => { if (pets.some((item) => item.id === id)) setSelected(id); },
    updatePet: (id, changes) => setPets((items) => items.map((item) =>
      item.id === id ? { ...item, ...changes, id: item.id } : item)),
  }}>{children}</Context.Provider>;
}
export function useApp() {
  const state = useContext(Context);
  if (!state) throw new Error('AppProvider required');
  return state;
}
