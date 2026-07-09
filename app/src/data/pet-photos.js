/* Gerçek evcil hayvan fotoğrafları (Unsplash, görsel olarak doğrulandı) —
 * emoji yerine kullanılıyor. Profil galerisi türe göre değişir; sahiplendirme
 * ve PatiMatch kartları sabit. */
const U = (id) => `https://images.unsplash.com/photo-${id}?w=400&q=70&fit=crop`;

export const GALLERY_PHOTOS = {
  kedi: [
    U('1514888286974-6c03e2ca1dba'),
    U('1518791841217-8f162f1e1131'),
    U('1450778869180-41d0601e046e'),
    U('1573865526739-10659fec78a5'),
    U('1533738363-b7f9aef128ce')
  ],
  kopek: [
    U('1552053831-71594a27632d'),
    U('1601758228041-f3b2795255f1'),
    U('1543466835-00a7907e9de1'),
    U('1543852786-1cf6624b9987'),
    U('1601979031925-424e53b6caaa')
  ]
};

export const ADOPTION_PHOTOS = {
  Minnoş: U('1596854407944-bf87f6fdd49e'),
  Karabaş: U('1633722715463-d30f4f325e24'),
  Gece: U('1533738363-b7f9aef128ce'),
  Pamuk: U('1546527868-ccb7ee7dfa6a')
};

export const MATCH_PHOTOS = {
  Duman: U('1514888286974-6c03e2ca1dba'),
  Zeus: U('1518791841217-8f162f1e1131'),
  Pamuk: U('1450778869180-41d0601e046e'),
  Leo: U('1573865526739-10659fec78a5'),
  Gölge: U('1596854407944-bf87f6fdd49e'),
  Luna: U('1601758228041-f3b2795255f1'),
  Maya: U('1543466835-00a7907e9de1'),
  Bella: U('1543852786-1cf6624b9987'),
  Fındık: U('1601979031925-424e53b6caaa')
};
