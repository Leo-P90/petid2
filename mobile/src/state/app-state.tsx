import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';
import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { matchReducer, type MatchStore, type MatchAction } from '../core/match-model';
import { demoPets, type Pet, type ThemeMode } from '../core/model';
import { palettes, parseTheme, THEME_KEY } from '../core/theme';
import { useAuth } from './auth-state';
import { createPetRepository } from '../services/pets';
import { supabase } from '../services/supabase';
type Storage = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;
type State = {
  matches: MatchStore; dispatchMatch: (action: MatchAction) => void;
  mode: ThemeMode; colors: typeof palettes.light; ready: boolean; notice: string; themeBusy: boolean;
  toggleTheme: () => Promise<void>; pets: Pet[]; pet: Pet;
  petsBusy: boolean; petNotice: string; accountMode: boolean;
  selectPet: (id: string) => void; updatePet: (id: string, changes: Partial<Pet>) => Promise<void>;
  createPet: (input: Pick<Pet, 'name' | 'species' | 'age'>) => Promise<void>; deletePet: (id: string) => Promise<void>;
  addPhoto: (uri: string) => Promise<void>; removePhoto: (uri: string) => Promise<void>;
};
const Context = createContext<State | null>(null);
const emptyPet: Pet = { id: '', name: '', species: 'Kedi', age: '', photos: [] };
const defaultPets = createPetRepository(supabase);
type AppProviderProps = { children: ReactNode; storage?: Storage; petRepository?: ReturnType<typeof createPetRepository> };
export function AppProvider(props: AppProviderProps) {
  const auth = useAuth();
  const scope = `${auth.demo ? 'demo' : auth.status}/${auth.session?.user.id ?? ''}`;
  return <AppSessionProvider key={scope} {...props} />;
}
function AppSessionProvider({ children, storage = AsyncStorage, petRepository = defaultPets }: AppProviderProps) {
  const auth = useAuth();
  const [mode, setMode] = useState<ThemeMode>('light');
  const [matches, dispatchMatch] = useReducer(matchReducer, {});
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [themeBusy, setThemeBusy] = useState(false);
  const themeLock = useRef(false);
  const [pets, setPets] = useState<Pet[]>(() => auth.status === 'signedIn' && !auth.demo ? [] : demoPets.map((pet) => ({ ...pet, photos: [] })));
  const [selected, setSelected] = useState(demoPets[0].id);
  const [petsBusy, setPetsBusy] = useState(false);
  const [petNotice, setPetNotice] = useState('');
  const accountMode = auth.status === 'signedIn' && !auth.demo;
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
  useEffect(() => {
    let active = true;
    if (!accountMode) {
      Promise.resolve().then(() => { if (active) {
        setPets(demoPets.map((item) => ({ ...item, photos: [] })));
        setSelected(demoPets[0].id); setPetsBusy(false); setPetNotice('');
      } });
      return () => { active = false; };
    }
    Promise.resolve().then(() => { if (active) { setPets([]); setSelected(''); setPetsBusy(true); setPetNotice(''); } });
    petRepository.list().then((items) => { if (active) { setPets(items); setSelected(items[0]?.id ?? ''); } })
      .catch(() => { if (active) setPetNotice('Hayvan profilleri yüklenemedi. Yeniden deneyin.'); })
      .finally(() => { if (active) setPetsBusy(false); });
    return () => { active = false; };
  }, [accountMode, auth.session?.user.id, petRepository]);
  useEffect(() => {
    if (!accountMode) return;
    let active = true;
    const refresh = () => Promise.all(pets.map((item) => petRepository.refreshPhotos(item)))
      .then((items) => { if (active) setPets(items); }).catch(() => { if (active) setPetNotice('Fotoğraf bağlantıları yenilenemedi.'); });
    const timer = setInterval(refresh, 50 * 60 * 1000);
    return () => { active = false; clearInterval(timer); };
  }, [accountMode, petRepository, pets]);
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
  const pet = pets.find((item) => item.id === selected) ?? pets[0] ?? emptyPet;
  async function updatePet(id: string, changes: Partial<Pet>) {
    setPetNotice('');
    if (!accountMode) { setPets((items) => items.map((item) => item.id === id ? { ...item, ...changes, id: item.id } : item)); return; }
    const before = pets;
    setPets((items) => items.map((item) => item.id === id ? { ...item, ...changes, id: item.id } : item));
    try { await petRepository.update(id, changes); }
    catch { setPets(before); setPetNotice('Profil kaydedilemedi. Değişiklik geri alındı.'); throw new Error('pet update failed'); }
  }
  async function createPet(input: Pick<Pet, 'name' | 'species' | 'age'>) {
    setPetsBusy(true); setPetNotice('');
    try { const created = await petRepository.create(input); setPets((items) => [...items, created]); setSelected(created.id); }
    catch { setPetNotice('Hayvan profili oluşturulamadı.'); throw new Error('pet create failed'); }
    finally { setPetsBusy(false); }
  }
  async function deletePet(id: string) {
    setPetsBusy(true); setPetNotice('');
    try { await petRepository.remove(id); setPets((items) => { const next = items.filter((item) => item.id !== id); setSelected(next[0]?.id ?? ''); return next; }); }
    catch { setPetNotice('Hayvan profili silinemedi.'); throw new Error('pet delete failed'); }
    finally { setPetsBusy(false); }
  }
  async function addPhoto(uri: string) {
    if (!accountMode) { await updatePet(pet.id, { photos: [...pet.photos, uri].slice(0, 5) }); return; }
    if (!auth.session || pet.photos.length >= 5) return;
    setPetsBusy(true); setPetNotice('');
    try { const added = await petRepository.uploadPhoto(auth.session.user.id, pet.id, uri); setPets((items) => items.map((item) => item.id === pet.id ? { ...item, photos: [...item.photos, added.url].slice(0, 5), photoObjects: { ...item.photoObjects, [added.url]: added.objectName } } : item)); }
    catch { setPetNotice('Fotoğraf yüklenemedi. JPEG, PNG veya WebP ve en fazla 10 MB kullanın.'); throw new Error('photo upload failed'); }
    finally { setPetsBusy(false); }
  }
  async function removePhoto(uri: string) {
    if (!accountMode) { await updatePet(pet.id, { photos: pet.photos.filter((item) => item !== uri) }); return; }
    const objectName = pet.photoObjects?.[uri]; if (!objectName) return;
    setPetsBusy(true); setPetNotice('');
    try { await petRepository.removePhoto(objectName); setPets((items) => items.map((item) => { if (item.id !== pet.id) return item; const nextObjects = { ...item.photoObjects }; delete nextObjects[uri]; return { ...item, photos: item.photos.filter((photo) => photo !== uri), photoObjects: nextObjects }; })); }
    catch { setPetNotice('Fotoğraf silinemedi.'); throw new Error('photo delete failed'); }
    finally { setPetsBusy(false); }
  }
  return <Context.Provider value={{
    matches, dispatchMatch,
    mode, colors: palettes[mode], ready, notice, themeBusy, toggleTheme, pets, pet, petsBusy, petNotice, accountMode,
    selectPet: (id) => { if (pets.some((item) => item.id === id)) setSelected(id); },
    updatePet, createPet, deletePet, addPhoto, removePhoto,
  }}>{children}</Context.Provider>;
}
export function useApp() {
  const state = useContext(Context);
  if (!state) throw new Error('AppProvider required');
  return state;
}
