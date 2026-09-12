import type { Candidate } from '../core/match-model';
// Synthetic profiles, reciprocal likes, distances and health badges. No real owners or verified records.
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&q=70&fit=crop`;
export const matchDemo: readonly Candidate[] = [
  { id: 'match-luna', species: 'Kedi', name: 'Luna', age: '2 yaş', breed: 'Tekir', gender: 'Dişi', distance: '2.4 km', bio: 'Sakin ve meraklı · Kurgu demo profil.', compatibility: 92, photo: photo('1514888286974-6c03e2ca1dba'), mutual: false, opener: 'Demo: Merhaba, küçük patiler!', reply: 'Demo otomatik yanıt: Oyun zamanı güzel olurdu.' },
  { id: 'match-ada', species: 'Kedi', name: 'Ada', age: '3 yaş', breed: 'Ankara Kedisi', gender: 'Dişi', distance: '1.2 km', bio: 'Oyun arkadaşı arıyor · Kurgu demo profil.', compatibility: 88, photo: photo('1518791841217-8f162f1e1131'), mutual: true, opener: 'Demo: Mia ile tanışmak güzel!', reply: 'Demo otomatik yanıt: Patili bir merhaba! 🐾' },
  { id: 'match-max', species: 'Köpek', name: 'Max', age: '3 yaş', breed: 'Golden Retriever', gender: 'Erkek', distance: '3.3 km', bio: 'Park yürüyüşlerini seviyor · Kurgu demo profil.', compatibility: 95, photo: photo('1552053831-71594a27632d'), mutual: true, opener: 'Demo: Atlas ile yürüyüş hayal edelim!', reply: 'Demo otomatik yanıt: Parkta oyun fikri harika.' },
  { id: 'match-maya', species: 'Köpek', name: 'Maya', age: '2 yaş', breed: 'Labrador', gender: 'Dişi', distance: '5.1 km', bio: 'Neşeli bir oyun arkadaşı · Kurgu demo profil.', compatibility: 84, mutual: false, opener: 'Demo: Merhaba!', reply: 'Demo otomatik yanıt: Hav hav!' },
];
