/* Hizmetler listesindeki her kayıt için başlangıç fiyatı ve mesafe bilgisi.
 * "online" true ise mesafe yerine "Online hizmet" gösterilir. */
export const SERVICE_INFO = {
  vet1: { priceLabel: 'Randevu başlangıç fiyatı', price: 350, distanceKm: 0.85 },
  otel1: { priceLabel: 'Günlük oda başlangıç fiyatı', priceSuffix: '/gece', price: 450, distanceKm: 2.1 },
  egt1: { priceLabel: 'Ders (seans) başlangıç fiyatı', priceSuffix: '/seans', price: 400, distanceKm: 3.5 },
  gez1: { priceLabel: 'Tur başlangıç fiyatı', priceSuffix: '/tur', price: 150, distanceKm: 1.8 },
  vet2: { priceLabel: 'Randevu başlangıç fiyatı', price: 400, distanceKm: 3.4 },
  egt2: { priceLabel: 'Seans başlangıç fiyatı', priceSuffix: '/seans', price: 500, online: true },
  gez2: { priceLabel: 'Katılım başlangıç fiyatı', priceSuffix: '/kişi', price: 100, distanceKm: 2.6 },
  kuafor1: { priceLabel: 'Bakım başlangıç fiyatı', price: 300, distanceKm: 1.4 },
  kuafor2: { priceLabel: 'Bakım başlangıç fiyatı', price: 350, distanceKm: 2.9 }
};
