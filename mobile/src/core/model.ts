export type ThemeMode = 'light' | 'dark';
export type Pet = { id: string; name: string; species: 'Kedi' | 'Köpek'; age: string; photos: string[]; photoObjects?: Record<string, string> };
export const demoPets: Pet[] = [
  { id: 'demo-mia', name: 'Mia', species: 'Kedi', age: '2 yaş', photos: [] },
  { id: 'demo-atlas', name: 'Atlas', species: 'Köpek', age: '3 yaş', photos: [] },
];
export const candidates = [
  { id: 'demo-luna', name: 'Luna', species: 'Kedi' as const, age: '2 yaş', note: 'Sakin ve meraklı' },
  { id: 'demo-ada', name: 'Ada', species: 'Kedi' as const, age: '3 yaş', note: 'Oyun arkadaşı arıyor' },
  { id: 'demo-max', name: 'Max', species: 'Köpek' as const, age: '3 yaş', note: 'Park yürüyüşlerini seviyor' },
];
export const adoptionListings = [
  { id: 'demo-pamuk', name: 'Pamuk', species: 'Kedi', note: 'Yalnızca arayüz örneği; gerçek sahiplendirme ilanı değildir.' },
  { id: 'demo-zeytin', name: 'Zeytin', species: 'Köpek', note: 'Yalnızca arayüz örneği; gerçek sahiplendirme ilanı değildir.' },
];
export function discover(species: Pet['species'], excluded: string[]) {
  return candidates.filter((pet) => pet.species === species && !excluded.includes(pet.id));
}
export function appendPhotos(existing: string[], incoming: string[]) {
  return [...new Set([...existing, ...incoming])].slice(0, 5);
}
export function validCoordinates(latitude: number, longitude: number) {
  return Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}
