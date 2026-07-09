/* Aşı Takvimi kartlarında genişleyen "olası yan etkiler" içeriği.
 * normal: uygulama sonrası sık görülen, kendiliğinden geçen etkiler.
 * riskli: nadir ama önemli — görülürse veterinerle iletişime geçilmeli. */
export const VACCINE_INFO = {
  karma: {
    normal: [
      'Enjeksiyon yerinde hafif şişlik veya hassasiyet (1-2 gün)',
      'Hafif halsizlik ve uyku hali',
      'Geçici iştah azalması',
      'Hafif ateş (24-48 saat içinde geçer)'
    ],
    riskli: [
      'Yüzde, dudakta veya kulaklarda şişlik / kaşıntı (alerjik reaksiyon belirtisi)',
      'Tekrarlayan kusma veya ishal',
      'Nefes almada güçlük',
      'Enjeksiyon yerinde birkaç haftadan uzun süren büyüyen sertlik',
      'Bayılma veya ani güçsüzlük (acil — hemen veterinere gidin)'
    ]
  },
  kuduz: {
    normal: [
      'Enjeksiyon bölgesinde hafif ağrı veya küçük şişlik',
      '1 gün kadar süren hafif yorgunluk',
      'Geçici iştahsızlık'
    ],
    riskli: [
      'Yüz veya kulak çevresinde şişlik (alerjik reaksiyon)',
      'Aşırı salya akışı ile birlikte kusma',
      'Nefes darlığı veya öksürük',
      'Enjeksiyon bölgesinde kalıcı sert şişlik (granülom) — büyüyorsa kontrol ettirin'
    ]
  },
  losemi: {
    normal: [
      'Enjeksiyon yerinde hafif hassasiyet',
      'Uygulama sonrası 1 gün süren iştahsızlık',
      'Hafif uyuşukluk'
    ],
    riskli: [
      'Enjeksiyon bölgesinde 3 haftadan uzun süren veya büyüyen kitle (nadir görülen aşı-ilişkili sarkom riski — mutlaka kontrol ettirin)',
      'Şiddetli alerjik reaksiyon: yüzde şişme, nefes darlığı',
      'Sürekli kusma veya halsizlik'
    ]
  },
  parazit: {
    normal: [
      'Uygulama sonrası kısa süreli huzursuzluk',
      'Damla formunda ise uygulama bölgesinde geçici yağlı görünüm veya hafif kızarıklık',
      'Hafif uyku hali'
    ],
    riskli: [
      'Aşırı salya akışı veya titreme (özellikle kedilerde yanlış doz/tür karışıklığında görülür)',
      'Şiddetli kusma veya ishal',
      'Uygulama bölgesinde yayılan cilt tahrişi',
      'Dengesizlik, kasılma gibi nörolojik belirtiler (acil — hemen veterinere gidin)'
    ]
  }
};
