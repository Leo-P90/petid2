// Synthetic provider discovery only. No bookings, verified ratings, live distance or contact details.
// Bundled AI-generated service illustrations; no real business identity or rating.
export const serviceCategories = ['Tümü', 'Veteriner', 'Kuaför', 'Otel', 'Eğitmen'] as const;
export type DemoService = { id: string; source: 'demo'; name: string; category: string; rating: string; reviews: number; distance: string; description: string; photo: number };
export const servicesDemo: readonly DemoService[] = [
  { id: 'pativet', source: 'demo', name: 'PatiVet Klinik', category: 'Veteriner', rating: '4.9', reviews: 128, distance: '1.2 km', description: 'Minik dostlara özenli bakım.', photo: require('../../assets/images/services/veterinary-v2.png') },
  { id: 'patistyle', source: 'demo', name: 'PatiStyle', category: 'Pet Kuaförü', rating: '4.8', reviews: 96, distance: '2.4 km', description: 'Tertemiz patiler, mutlu dönüşler.', photo: require('../../assets/images/services/grooming-v2.png') },
  { id: 'patikonak', source: 'demo', name: 'PatiKonak', category: 'Pet Oteli', rating: '4.9', reviews: 84, distance: '3.1 km', description: 'Ev sıcaklığında küçük bir mola.', photo: require('../../assets/images/services/hotel-v2.png') },
  { id: 'patiakademi', source: 'demo', name: 'PatiAkademi', category: 'Eğitmen', rating: '4.7', reviews: 62, distance: '2.8 km', description: 'Birlikte daha güzel yürüyüşler.', photo: require('../../assets/images/services/training-v2.png') },
];

export const serviceLocation = { source: 'demo' as const, city: 'İstanbul' };
