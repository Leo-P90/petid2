# PetID V1 uygulama görevi

Kullanıcı tarafından onaylanan kapsam. Çalışma branch'i: v1-release. Bu belge uygulamanın tamamlandığı anlamına gelmez.

## Ürün biçimi ve mobil mimari
- PetID V1 bir mobil uygulamadır; web sitesi olarak yayınlanması hedef değildir.
- Mobil uygulama Expo + React Native ile geliştirilecektir. Mevcut Vite uygulamasındaki iş kuralları, veri modelleri, içerik ve görsel dil referans alınacak; DOM/HTML arayüzü React Native ekranları olarak yeniden kurulacaktır.
- Android ve iOS Expo projesindeki aynı TypeScript kaynak kodunu kullanmalı. Öncelikli teslim Android development build ve test APK; iOS proje yapılandırması aynı dilimde hazır tutulmalı.
- Web preview yalnızca geliştirme ve hızlı test için kullanılmalı.
- Safe-area, ekran çentiği, durum çubuğu, klavye, geri tuşu, dokunma hedefleri, dikey mobil yerleşim ve küçük ekran taşmaları ele alınmalı.
- Konum, kamera/fotoğraf seçimi, dosya erişimi, dış telefon/WhatsApp bağlantıları ve bildirim izinleri mobil cihaz davranışıyla test edilmeli.
- Uygulama internet kesildiğinde anlaşılır hata göstermeli; yerel prototip verisini gerçek sunucu verisi gibi sunmamalı.
- Expo app config, EAS profilleri, uygulama kimlikleri, ikon/splash yerleri, environment yönetimi ve imzalama dışındaki release adımları repoda belgelenmeli.
- Uygulama mağazası yayınlama, gerçek imzalama anahtarları ve üretim dağıtımı ayrıca onaylanmadan yapılmamalı.

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

## İkinci geliştirme dilimi: Expo mobil temel
1. Birinci dilim PR'ının head branch'ini temel al; değişiklikleri kaybetme.
2. Repo içinde ayrı ve açık bir Expo + React Native TypeScript uygulaması oluştur. Expo Router kullan; web prototipini mobil runtime içinde WebView olarak paketleme.
3. Android/iOS kimliklerini, görünen adı, ikon/splash ve development/preview/production EAS profillerini merkezi Expo konfigürasyonunda tanımla.
4. Expo Router navigasyonu, safe-area, klavye, Android geri tuşu, expo-image-picker, expo-location, dosya seçimi ve Linking davranışlarını mobil cihaz için uygula.
5. Önce uygulama kabuğu, tema, alt navigasyon ve şu ekranların React Native karşılıklarını kur: ana sayfa, profil, sağlık, kayıp/yaralı, acil veteriner, PatiMatch, sahiplendirme.
6. Android development build veya test APK üretimini doğrula. İmzalı production AAB veya mağaza yüklemesi yapma.
7. TypeScript/lint/test kontrolleri ile EAS development build adımlarını CI ve yerel geliştirme için belgele.

## Sonraki geliştirme dilimleri
- Supabase hesap/pet kalıcılığı, private dosya depolama ve veri sahipliği. Boş hesap/demo verileri karışmamalı; kaydetme hataları görünür olmalı.
- Sağlık kayıtlarını owner_id/pet_id ile ayır. Gerçek klinik doğrulaması hazır değilse kullanıcı yüklemesini veteriner onaylı etiketleme.
- Kayıp ilanı ve ihbar backend'i; sahibin kapatma yetkisi, durum geçmişi, şikayet.
- PatiMatch ve sahiplendirme backend'i; karşılıklı erişim, bloklama, moderasyon. Sahip rızası olmadan sağlık veya iletişim bilgilerini açma.
- QR paylaşımında izin verilen alanlar, iptal ve yetkisiz erişim testleri.
- Yayına hazırlık: gizlilik metinleri, hesap/veri silme, mobil cihaz QA, CI, ortam kurulumu ve geri alma dokümanı.

## Doğrulama kapıları
- İki hesap arasında özel profil, sağlık dosyası veya mesaj erişimi olmamalı.
- İki hayvanın sağlık, fotoğraf ve profil verileri karışmamalı.
- İlanı başka kullanıcı kapatamamalı; ihbar tek başına ilanı kapatmamalı.
- PatiMatch karşılıklı eşleşme ve engelleme sunucu tarafında uygulanmalı.
- Sahiplendirme ilanını yalnızca yetkili sahibi düzenleyebilmeli.
- Client paketinde gizli API anahtarı bulunmamalı.
- Expo uygulaması Android açılış, geri tuşu, fotoğraf seçimi, konum izni, tema ve temel navigasyon testlerini geçmeli.
- Canlı veritabanına geçiş öncesi hedef ortam ve migration etkileri doğrulanmalı. Sırları koda veya rapora yazma.

## Başlangıç kanıtı
İncelenen başlangıç: 29cff6582fe8da3480d12dc4fa5e1fde13e87904 (master, 24 Temmuz 2026). O noktada build ve dört içerik testi geçiyordu; backend ve uçtan uca kullanıcı davranışı doğrulanmış değildi.
