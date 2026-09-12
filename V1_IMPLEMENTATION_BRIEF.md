# PetID V1 uygulama görevi

Kullanıcı tarafından onaylanan kapsam. Çalışma branch'i: v1-release. Bu belge uygulamanın tamamlandığı anlamına gelmez.

## V1 kapsamında
- E-posta/parola kayıt, giriş, çıkış ve hesap kurtarma.
- Çoklu hayvan profili, fotoğraf yönetimi, dijital kimlik ve iptal edilebilir QR paylaşımı.
- Hayvana özel sağlık geçmişi: aşı, ilaç, kilo, muayene ve gerçek belge yükleme/indirme.
- Profil hayvanı veya başka hayvan için konumlu kayıp/yaralı ilanı; hareketli harita, gördüm/güvende ihbarı, yalnızca ilan sahibinin onayıyla kapatma ve arşivleme.
- Acil veteriner ekranı; doğrulanmamış klinik bilgilerini canlı veya açık olarak sunma.
- PatiMatch: aynı tür keşif, katılım tercihi, beğen/geç, karşılıklı eşleşme, mesajlaşma, engelleme ve şikayet.
- Sahiplendirme: ilan oluşturma/düzenleme, fotoğraflar, liste/detay, başvuru veya iletişim, ilanı kapatma, şikayet. Statik örnek kartları gerçek ilan gibi sunma.
- Açık/koyu tema ve mobil kullanım.

## Sonraya ertelenenler
Eğitim, günlük eğitim görevleri, dersler, zeka oyunları, antrenmanlar, eğitim videoları; Pixel Pet ve oyun mağazası; Pati Market; genel topluluk akışı; PETID AI/Gemini; Google/Apple giriş; Telegram.
Eğitim git geçmişinde korunmalı. Üretim menüsü, ekranı, bağlantısı ve paketinden çıkarılmalı. Sahiplendirme ve PatiMatch kesinlikle korunmalı.

## Birinci geliştirme dilimi
1. Repo yönergelerini ve mevcut çalışma ağacını incele. Güncel branch başını esas al.
2. app/index.html içindeki gömülü derlenmiş uygulama ile app/src ayrışmasını çöz. Gömülü kodun kayıp ilanı, harita, fotoğraf ve diğer korunacak davranışlarını önce envanterle; yalnızca eski src/main.js dosyasına dönerek özellik kaybetme.
3. Korunacak mantığı okunabilir kaynak modüllerine taşı. Tek giriş noktası src/main.js olsun. Inline bundle ve premium-upgrade runtime override bağımlılığını kaldır.
4. V1 dışı ekranlar ve bağlantılar kaldırılırken ortak profil/fotoğraf/tema fonksiyonlarını ayır; gizli oyun döngüleri veya AI istekleri çalışmasın.
5. Ana ekran ve menüyü V1 kapsamına göre düzenle. Her korunmuş ekrana ulaşılabilsin. Tasarımı gereksiz yere sıfırdan değiştirme.
6. npm ci, npm test, npm run build çalıştır; gerçek tarayıcıda gezinme, profil değiştirme ve tema kontrolü yap. Mevcut dört içerik testi tek başına yeterli değildir.
7. Sonuçları, kalan prototipleri ve test sınırlarını açıkça kaydet. İnceleme için draft PR hazırla; master'a merge veya üretime yayın yapma.

## Sonraki geliştirme dilimleri
- Supabase hesap/pet kalıcılığı, private dosya depolama ve veri sahipliği. Boş hesap/demo verileri karışmamalı; kaydetme hataları görünür olmalı.
- Sağlık kayıtlarını owner_id/pet_id ile ayır. Gerçek klinik doğrulaması hazır değilse kullanıcı yüklemesini veteriner onaylı etiketleme.
- Kayıp ilanı ve ihbar backend'i; sahibin kapatma yetkisi, durum geçmişi, şikayet.
- PatiMatch ve sahiplendirme backend'i; karşılıklı erişim, bloklama, moderasyon. Sahip rızası olmadan sağlık veya iletişim bilgilerini açma.
- QR paylaşımında izin verilen alanlar, iptal ve yetkisiz erişim testleri.
- Yayına hazırlık: gizlilik metinleri, hesap/veri silme, mobil QA, CI, ortam kurulumu ve geri alma dokümanı.

## Doğrulama kapıları
- İki hesap arasında özel profil, sağlık dosyası veya mesaj erişimi olmamalı.
- İki hayvanın sağlık, fotoğraf ve profil verileri karışmamalı.
- İlanı başka kullanıcı kapatamamalı; ihbar tek başına ilanı kapatmamalı.
- PatiMatch karşılıklı eşleşme ve engelleme sunucu tarafında uygulanmalı.
- Sahiplendirme ilanını yalnızca yetkili sahibi düzenleyebilmeli.
- Client paketinde gizli API anahtarı bulunmamalı.
- Canlı veritabanına geçiş öncesi hedef ortam ve migration etkileri doğrulanmalı. Sırları koda veya rapora yazma.

## Başlangıç kanıtı
İncelenen başlangıç: 29cff6582fe8da3480d12dc4fa5e1fde13e87904 (master, 24 Temmuz 2026). O noktada build ve dört içerik testi geçiyordu; backend ve uçtan uca kullanıcı davranışı doğrulanmış değildi.
