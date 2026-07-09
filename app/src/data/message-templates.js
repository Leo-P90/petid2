/* PatiMatch eşleşmelerinde otomatik açılış mesajları ve kanned yanıtlar. */
export function openerFor(c) {
  const openers = [
    'Merhaba! ' + c.ad + ' ile eşleştik 🎉 Ne zaman tanışalım?',
    'Selam! Profilini gördüm, çok tatlıymış 🥰 Bir ön görüşme yapalım mı?',
    'Merhaba, sağlık testleri ve aşı karnesini paylaşabilir misin? Öyle devam edelim 📋'
  ];
  return openers[Math.floor(Math.random() * openers.length)];
}

export const AUTO_REPLIES = [
  'Harika, uygun olduğun bir gün söyler misin? 📅',
  'Tabii, veteriner kontrolü için hangi kliniği düşünüyorsun? 🩺',
  'Tanışma için güvenli bir yerde (parkta ya da klinikte) buluşalım mı?',
  'Sağlık testi sonuçlarını da paylaşırım, sen de gönderirsen süper olur 📄',
  'Çok sevindim, umarım aramızda güzel bir bağ kurarız 🐾',
  'Anlaştık! Detayları bu hafta netleştirelim.'
];
