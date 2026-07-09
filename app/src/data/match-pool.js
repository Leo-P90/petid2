import { MATCH_PHOTOS } from './pet-photos.js';

/* PatiMatch aday havuzu — tür bazlı (kedi/köpek) eşleştirme adayları */
export const MATCH_POOL = {
  kedi: [
    { ad: 'Duman', cins: 'British Shorthair', yas: '3 yaş', cinsiyet: 'Erkek', km: '2.4 km', e: '🐱', foto: MATCH_PHOTOS['Duman'], bio: 'Sakin, mırıltısı bol bir beyefendi. Soy kütüğü belgeli, sağlık testleri eksiksiz.', uyum: 92, likes: true },
    { ad: 'Zeus', cins: 'Tekir', yas: '4 yaş', cinsiyet: 'Erkek', km: '1.2 km', e: '🐈‍⬛', foto: MATCH_PHOTOS['Zeus'], bio: 'Mahallenin en yakışıklısı. Deneyimli sahip, ilk görüşme evde yapılabilir.', uyum: 78, likes: true },
    { ad: 'Pamuk', cins: 'Van Kedisi', yas: '2 yaş', cinsiyet: 'Erkek', km: '5.1 km', e: '🐈', foto: MATCH_PHOTOS['Pamuk'], bio: 'Enerjik ve oyuncu — suyla arası şaşırtıcı derecede iyi! Aşı karnesi güncel.', uyum: 85, likes: false },
    { ad: 'Leo', cins: 'Scottish Fold', yas: '2.5 yaş', cinsiyet: 'Erkek', km: '7.8 km', e: '😺', foto: MATCH_PHOTOS['Leo'], bio: 'Katlanmış kulaklar, kocaman gözler. Genetik taraması yapıldı, sonuçlar paylaşılır.', uyum: 88, likes: true },
    { ad: 'Gölge', cins: 'Ankara Kedisi', yas: '3 yaş', cinsiyet: 'Erkek', km: '4.5 km', e: '🐱', foto: MATCH_PHOTOS['Gölge'], bio: 'Uzun tüylü, zarif ve sakin. Ev ortamında büyüdü, çocuklarla arası iyi.', uyum: 81, likes: false }
  ],
  kopek: [
    { ad: 'Luna', cins: 'Golden Retriever', yas: '2 yaş', cinsiyet: 'Dişi', km: '3.3 km', e: '🐕', foto: MATCH_PHOTOS['Luna'], bio: 'Kalça displazisi taraması temiz. Neşeli, itaat eğitimi tamamlanmış.', uyum: 95, likes: true },
    { ad: 'Maya', cins: 'Labrador', yas: '3 yaş', cinsiyet: 'Dişi', km: '2.1 km', e: '🦮', foto: MATCH_PHOTOS['Maya'], bio: 'Su ve apport delisi. Daha önce sağlıklı bir doğum yaptı, veteriner referanslı.', uyum: 89, likes: true },
    { ad: 'Bella', cins: 'Border Collie', yas: '2.5 yaş', cinsiyet: 'Dişi', km: '6.7 km', e: '🐕‍🦺', foto: MATCH_PHOTOS['Bella'], bio: 'Zeka küpü — 40+ komut biliyor. Aktif bir eş arıyor, çoban kökenli hatlardan.', uyum: 84, likes: false },
    { ad: 'Fındık', cins: 'Cocker Spaniel', yas: '4 yaş', cinsiyet: 'Dişi', km: '1.9 km', e: '🐶', foto: MATCH_PHOTOS['Fındık'], bio: 'Uysal ve sevecen. Kulak sağlığı düzenli kontrol altında, aşıları tam.', uyum: 87, likes: true }
  ]
};
