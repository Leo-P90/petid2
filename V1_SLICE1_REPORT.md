# V1 dilim 1 — başlangıç envanteri

Başlangıç: `177f963`, temiz `v1-release` çalışma ağacı. Repo içinde AGENTS.md yok.

| Davranış | Gömülü uygulama | Eski src | Karar |
| --- | --- | --- | --- |
| Profil seçme/ekleme/düzenleme, dijital kimlik | Var | Var | Kaynak profil modülü; oyun bağı koparılacak |
| Çoklu fotoğraf (en çok 5), küçültme, önizleme, kaldırma | Var | Tek fotoğraf | Gömülü çoklu fotoğraf korunacak |
| Kayıp/yaralı/başka hayvan, Leaflet, pin sürükleme, konum | Var | Yok | Kaynak ilan modülüne çıkarılacak |
| Gördüm/güvende, sahip onayı, arşiv, şikayet, yerel hız sınırı | Var | Yok | Korunacak; istemci prototipi, sunucu güvencesi değil |
| Acil liste, kart açma, mesafeye göre sıralama | İkinci inline script | Yok | Modüle taşınacak; doğrulanmamış saat/telefon iddiaları kaldırılacak |
| Aşı, sağlık panelleri, reçete/geçmiş, kayıt formu | Bundle + premium override | Kısmi | Açık modül kurulumu; override kaldırılacak |
| PatiMatch, beğen/geç, örnek eşleşme, mesaj | Var | Var | Korunacak; demo olarak işaretlenecek |
| Sahiplendirme kartları | Var | Var | Korunacak; örnek veri olarak işaretlenecek |
| Eğitim, Pixel Pet, oyun mağazası, Pati Market, topluluk, AI/Gemini | Var | Var | Ekran/link/importlar üretim girişinden çıkarılacak |
| Tema ve saat arka planı | Var | Kısmi | Ortak tema/sahne modülü |

QR görseli statik, paylaşım işlevsiz. Sağlık belgeleri yalnızca dosya metaverisi; gerçek yükleme/indirme yok. Hesap kalıcılığı, veri sahipliği ve diğer backend işleri bu dilimin dışında. Bu başlangıç davranışları tamamlanmış ürün olarak sunulmayacak.

## Uygulanan sonuç

- Tek uygulama girişi `app/src/main.js`. HTML içindeki 268 KB derlenmiş script, pixel bayrak müdahalesi ve AI/Gemini inline script kaldırıldı. `premium-upgrade.js` kaldırıldı; sağlık kurulumu açık modül API'siyle yapılıyor, fonksiyon override'ı yok.
- İlanlar/Leaflet, sahip onaylı ihbar/arşiv, acil liste, çoklu fotoğraf ve profil kaynak modüllerine taşındı. İlan kaynakları tekrar okunabilir fonksiyon/alan isimleriyle yazıldı; derlenmiş, ulaşılamayan `null.from(...)` backend dalları taşınmadı.
- Ortak profil/fotoğraf/tema modülleri oyun motoru, eğitim, market ve AI modüllerini import etmiyor. Kayıp ekranının ve güncel görünümün eski src CSS'inde bulunmayan stilleri `preserved-shell.css` ve `shell.css` kaynaklarına alındı. Ertelenen ekran stilleri üretim stil girişinden çıkarıldı.
- Menü: ana ekran, profil, sağlık, ilanlar/PatiMatch. İlan, PatiMatch, mesajlar ve örnek sahiplendirme erişilebilir. Genel hizmet kategorileri V1 menüsünden çıkarıldı; veteriner girişi aynı doğrulanmamış acil listeyi açıyor. Var olmayan rotalar yok sayılıyor.
- Statik QR/paylaşım, sağlık bakım ölçümleri/belgeleri, sahiplendirme ve PatiMatch açıkça prototip/demo olarak işaretlendi. Doğrulanmamış kliniklere “açık”, ücretsiz veya indirim etiketi ve sahte telefon/WhatsApp bağlantısı verilmedi.
- Sağlık formu yalnızca “Kullanıcı ekledi” kaydı üretir; veteriner onayı iddiası oluşturamaz. Yerel sağlık kayıtları seçili pet anahtarıyla ayrıldı; eski anahtarsız kayıtlar hayvana otomatik atanmadı. Kişisel not korunur; AI özeti üretilmez.
- İlan depolama/fotoğraf hataları başarılı yayın gibi gösterilmez. Fotoğraf okuma başarısızsa önceki seçim korunur. Dinamik profil, ilan ve mesaj listesi metinleri HTML olarak çalıştırılmaz.
- İlan arşivleme sahip kontrolünden sonra uygulama içi klavye erişimli onay diyaloğu ister. İhbar tek başına ilanı kapatmaz.

## Doğrulama — 12 Eylül 2026

`app/` içinde:

- `npm ci`: başarılı, kilit dosyasından 25 paket kuruldu. Harita bağımlılığı `leaflet@1.9.4` sabitlenip lockfile'a eklendi.
- `npm test`: **14/14 geçti** (önceki 4 içerik testi + 10 V1 davranış/bağımlılık testi).
- `npm run build`: başarılı, Vite 8.1.3. Son uygulama JS paketi yaklaşık 192 KB (gzip 60 KB). `dist/` PR'a eklenmedi.
- Davranış testleri: tek giriş, ertelenen runtime importlarının dışlanması, profil/fotoğraf ayrımı ve kaldırma, beş fotoğraf sınırı/okuma hatası, sahip/non-owner arşiv/ihbar kararları, ihbarın pending kalması, arşiv iptali, yerel sağlık pet ayrımı ve trust etiketi, sağlık panelleri, tema kalıcılığı.

Gerçek Codex tarayıcısında **production build preview**, `127.0.0.1:4173`:

- Ana menüden profil/sağlık/ilanlar, PatiMatch ve mesaj ekranları gezildi; örnek sahiplendirme kartları ve demo uyarısı görüldü.
- Boncuk → Zeytin → Boncuk değişimi; iki sentetik SVG fotoğrafın dosya seçiciden yüklenmesi, JPEG küçültülmesi ve kaydı: Boncuk'ta 2, Zeytin'de 0, geri dönünce 2 fotoğraf.
- Açık/koyu tema ve reload sonrası tema kalıcılığı. 390 × 844 px mobil görünüm incelendi; viewport daha sonra sıfırlandı.
- Sağlık sekmelerinde `aria-selected`, yerel kayıt formu ve kişisel not kaydı; Zeytin'deki sentetik kayıt Boncuk'ta görünmedi.
- Leaflet tile'ları, haritaya tıklayıp pin/koordinat seçimi, zoom, profil hayvanı ve başka hayvan için konumlu demo ilan oluşturma; sahip onayıyla arşivleme.
- PatiMatch geç işlemi aday değiştirdi; demo beğenme Duman eşleşmesini açtı; mesaj ekranına geçilip sentetik mesaj gönderildi, liste metni HTML olarak çalışmadı.
- Acil liste demo/doğrulanmamış saat etiketleriyle açıldı; telefonlara arama yapılmadı.
- Son test sekmesinde console **error listesi boş**. İlk dev sunucusu paket kurulumu sırasında sürüm değiştiği için Vite client hatası verdi; sunucu durdurulup doğrulama production preview'de tekrarlandı. İlk native confirm diyaloğu tarayıcı otomasyonunu kilitledi; uygulama içi diyaloğa geçildikten sonra arşivleme tekrar başarıyla doğrulandı.

## Kalan prototipler ve sınırlar

- Bu PR V1'in tamamı veya yayın onayı değildir. Supabase hedefi/ortamı, migration, auth/hesap kurtarma, boş hesap/demo ayrımı ve sunucu veri sahipliği test edilmedi ve bu dilimde değiştirilmedi. Mevcut SDK/state auth bağımlılığı korunuyor; doğrulama ortamında Supabase yapılandırması yok.
- İlanlar/ihbar/şikayet aynı tarayıcının localStorage'ında. Yerel sahip kontrolü ve hız sınırı sunucu güvenliği değildir; iki gerçek hesap/cihaz arasında delivery, closure yetkisi veya moderasyon garantisi verilmez. Eski sahip anahtarı olmayan cihaz kayıtları önceki yerel formatla uyumlu okunur.
- Sağlık dosyaları yalnızca metaveri, gerçek binary upload/download yok. Yerel pet ayrımı iki hesap arasında gizlilik garantisi vermez; private storage, owner_id/pet_id/RLS ve klinik doğrulaması sonraki dilimdedir. Bakım kartları örnektir.
- PatiMatch örnek adaylar, istemci beğeni/eşleşme ve otomatik demo mesajlarıdır; tercihler, kalıcılık, gerçek karşılıklılık, bloklama ve şikayet backend'i yok. Hayvanlar/hesaplar arası mesaj erişim güvenliği doğrulanmadı.
- Sahiplendirme mevcut örnek kartları korur; oluşturma/düzenleme/detay/başvuru/kapatma/şikayet backend'i henüz yok. QR statik görsel; paylaşım/iptal işlevi yok ve paylaşım butonu kapalı.
- Konum izni verilmedi: gerçek cihaz geolocation başarı yolu, pin sürükleme, OS dosya izinleri, gerçek veteriner telefonları, dış hesaplar ve üretim ortamı doğrulanmadı. Manuel harita seçimi/zoom çalıştı. Sentetik QA verisi yalnızca test tarayıcısındadır.
- `npm audit` ek kontrolü iki **dev bağımlılık** uyarısı bildirdi: nanoid ve postcss (kilit dosyasındaki mevcut Vite transitifleri). Bu PR'da bağımsız güvenlik/dependency yükseltmesi yapılmadı; yayından önce ele alınmalı.
- Eğitim/oyun/AI kaynakları git geçmişi ve mevcut import edilmeyen dosyalarda korunuyor; uygulama giriş grafiği bunları production JS paketine almıyor. CI/gerçek E2E otomasyon ve geniş cihaz QA'sı sonraki yayına hazırlık dilimindedir.
- Mevcut ortak state katmanı eski oyun metaverisini (`flappyBest` vb.) ve yapılandırılmış hesaplarda `game_states` kalıcılık çağrılarını hâlâ taşıyor; oyun motoru, zamanlayıcı/döngü veya oyun ekranı çalıştırmıyor. Auth/state kalıcılığının tam yeniden tasarımı sonraki Supabase dilimine bırakıldı. Derlenmiş pakette Gemini endpoint/anahtar adı, eğitim ders metni ve Pixel oluşturma fonksiyonu bulunmadı.

PR hedefi `v1-release`, çalışma branch'i `codex/v1-slice-1`, **draft**. Master'a merge, auto-merge, deployment veya canlı veritabanı değişikliği yapılmadı.
