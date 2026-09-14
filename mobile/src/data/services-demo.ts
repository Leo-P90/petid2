// Synthetic provider discovery only. No bookings, verified ratings, live distance or contact details.
// Reuse the project's existing decorative Unsplash animal images, not real clinic identity photos.
export const serviceCategories = ['Tümü', 'Veteriner', 'Pet Kuaförü', 'Pet Oteli', 'Eğitmen'] as const;
export type DemoService = { id: string; source: 'demo'; name: string; category: string; rating: string; reviews: number; distance: string; description: string; photo: string };
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&q=70&fit=crop`;
export const servicesDemo: readonly DemoService[] = [
  { id: 'pativet', source: 'demo', name: 'PatiVet Klinik', category: 'Veteriner', rating: '4.9', reviews: 128, distance: '1.2 km', description: 'Minik dostlara özenli bakım.', photo: photo('1514888286974-6c03e2ca1dba') },
  { id: 'patistyle', source: 'demo', name: 'PatiStyle', category: 'Pet Kuaförü', rating: '4.8', reviews: 96, distance: '2.4 km', description: 'Tertemiz patiler, mutlu dönüşler.', photo: photo('1552053831-71594a27632d') },
  { id: 'patikonak', source: 'demo', name: 'PatiKonak', category: 'Pet Oteli', rating: '4.9', reviews: 84, distance: '3.1 km', description: 'Ev sıcaklığında küçük bir mola.', photo: photo('1518791841217-8f162f1e1131') },
  { id: 'patiakademi', source: 'demo', name: 'PatiAkademi', category: 'Eğitmen', rating: '4.7', reviews: 62, distance: '2.8 km', description: 'Birlikte daha güzel yürüyüşler.', photo: photo('1552053831-71594a27632d') },
];
