# V1 Dilim 2 — Issue #4 doğrulama raporu

Başlangıç `codex/v1-slice-1@44397e5`; ayrı branch `codex/v1-slice-2-expo`, hedef `v1-release`. Birinci dilim dosyaları değiştirilmedi. Kapsam belgesi `v1-release@7fe841d` ile eşitlendi. Bu dilim mobil temel ve ekran iskeletidir; tamamlanmış V1 veya production teslimi değildir.

## Uygulanan

`mobile/` Expo SDK 57 + React Native 0.86 + strict TypeScript, Expo Router dört alt sekme ve Stack. Home/profil/sağlık/kayıp-yaralı/acil/PatiMatch/sahiplendirme liste-detay React Native bileşenleridir; web uygulamasını WebView ile sarmalama veya web bundle import'u yoktur.

Tema AsyncStorage'da kalır; paralel yazma kilidi ve saklama hatası mesajları vardır. Native Appearance ve StatusBar temaya bağlıdır. Safe-area, 48dp düğmeler, scroll, keyboard resize/avoidance ve Router Android back-history yapılandırıldı.

Fotoğraf/foreground konum/dosya/telefon-WhatsApp arayüzleri gerçek Expo/RN SDK adaptörlerine bağlıdır. Kullanıcı işlem başlatmadan izin istenmez; red/kalıcı red/iptal/hata ayrıdır. GPS kapalı veya 20 saniye yanıt yoksa hata gösterilir. Galeri beş fotoğraf, dosya 10MB sınırı; hayvan kimliğine göre ayrım. Kamera/mikrofon/background location yoktur.

Merkezi app.config.ts, Android/iOS dev-preview-production kimlikleri, ikon/splash yolları ve EAS profilleri hazır. Kimlikler geçici; marka sahipliği ayrıca doğrulanmalı. Varlıklar Expo şablonundan geçici ikon/splash'tır. Secrets, EAS projectId, production keystore veya store hesabı eklenmedi. Yerel debug APK ve yetkili kullanıcı EAS development/preview adımları mobile/README.md'de; production build/yayın adımları çalıştırılmadı.

## Geçen kontroller

- TypeScript `npm run typecheck` ve sıfır uyarılı `npm run lint`.
- Mobil Jest: 5 suite, 28 test. Service success/cancel/denial/errors, gerçek adaptör sözleşmeleri (mock native SDK), GPS timeout, config/EAS/runtime dışlama, aynı tür keşif, beş fotoğraf sınırı, profil fotoğraf ayrımı, tema disk yükleme/yazma hatası ve ekran etkileşimleri.
- Expo Doctor 21/21.
- `expo prebuild --platform android --no-install`: native Android proje üretimi geçti. Manifest'te kamera/mikrofon/background location remove, predictive back ve keyboard adjustResize kontrol edildi.
- Android Metro/Hermes export ve web static export başarılı. Android JS export **APK değildir**.
- Birinci dilim web referansı: 14/14 test ve Vite build tekrar geçti.
- Gerçek tarayıcı, build çıktısı: dört sekme ve Stack gezinme; profil değişimi/ad düzenleme; iki sentetik SVG galeri seçimi ve hayvan fotoğraf ayrımı; health dosya picker ve Mia/Atlas dosya ayrımı; manuel koordinatla yayınsız ilan taslağı; PatiMatch katılım/beğen/geç; örnek sahiplendirme detay URL'si/reload; geçersiz telefonun bağlantı açmaması; açık-koyu tema ve reload kalıcılığı.
- 360/390/430px viewport. Ölçülen sayfalarda yatay scrollWidth viewport'a eşit, görünür düğmeler 48px. Son browser error log boş.

## Android APK / cihaz kapısı

Yerel debug APK **başarılı**: aynı `36e8fdf` commit'i kısa gerçek QA klasöründe temiz npm ci, Android prebuild ve Gradle assembleDebug ile derlendi. `BUILD SUCCESSFUL in 5m 47s`, 672 task. NDK 27.1.12297006, SDK 36, Build Tools 36/35 ve CMake 3.22.1 hazırlandı; doğrudan indirilen arşivler resmi repository XML SHA-1 checksum'larıyla doğrulandı.

İlk deneme uzun Windows yolunda CMake object-path/Ninja dirty-manifest hatası verdi. Yalnızca üretilmiş native proje/önbellekler yedeklendi. Geçici P: alias denemesi Node/Gradle “different roots” hatası verdi ve alias kaldırıldı. Kısa gerçek klasörde temiz kurulum bu hataları aştı; son build'de SDK deprecation ve bazı object-path uyarıları kaldı ama derleme geçti.

APK: `petid-v1-slice2-development.apk`, 154239145 byte. AAPT: `com.petid.app.dev`, `PetID Dev`, version 0.1.0/code 1, min SDK 24/target 36, arm64-v8a + x86_64. apksigner verify geçti; v2 imza, `CN=Android Debug`. Production signing anahtarı değildir, git'e eklenmedi. SHA-256: `68a6b59030e4faf0313e93ae10308a5738a403727ecb8e1d11d129a793e8a0f9`. Development client APK Metro gerektirir; bağımsız preview veya production paket değildir.

Bu ortamda Android Studio/JDK/SDK vardır; WHPX hızlandırması kullanılabilir ama son ADB kontrolünde bağlı cihaz/emülatör yoktur. Kullanıcı system-image indirmesini ve emülatör kurulumunu Android Studio'da tamamlıyor. İmajın lisans onayı kullanıcıya bırakıldı; yeni lisanslar otomatik kabul edilmedi. Android açılış, fiziksel geri/klavye/safe-area, native picker izin ver-red-kısıtlı erişim ve dış telefon/WhatsApp uygulamaları **gerçek cihazda doğrulanmadı**. Web ve mock SDK testleri bunların yerine sayılmaz. iOS native derleme/QA Windows'ta yapılmadı. mobile/README.md cihaz kabul listesi açık kalır.

## Bilinen prototipler ve riskler

Backend bağlantısı yok; ekranlar açıkça demo modundadır. Tema dışındaki değişiklikler oturumluk. Hesap/auth, gerçek kalıcı profil/sağlık/private dosya upload-download, paylaşılabilir/iptal edilebilir QR, canlı interaktif harita/ihbar/sahip onayı/arşiv backend'i, gerçek PatiMatch eşleşme/mesaj/moderasyon ve sahiplendirme CRUD/başvuru/iletişim sonraki dilimdir. Harita şu an koordinat önizleme iskeletidir. Örnek klinik iletişimi, açık/nöbetçi iddiası ve gerçek sahiplendirme kartı iddiası yoktur.

Android picker activity/process ölümü pending-result kurtarması henüz uygulanmadı. GPS timeout JS beklemesini sınırlar; Expo tek seferlik native konum isteğinin iptal API'si yoktur. Büyük sistem fontu ve native status/navigation bar QA cihaz kapısında açıktır.
Expo SDK'nın transitif `expo-dom-webview` native/DOM interop bağımlılığı vardır. Bu, PetID web prototipini sarmalama değildir; tüm PetID ekranları RN bileşenleridir ve uygulama kaynaklarında WebView/DOM import'u yoktur. Source-gate testi uygulama kaynaklarını denetler, tüm vendor SDK bileşenlerinin fiziksel olarak yokluğunu iddia etmez.

Mobil npm audit: 14 orta, 0 yüksek/kritik. Başlıca Expo iOS build-tool xcode/uuid ve Router query-string/decode-uri-component transitif uyarıları. npm'nin önerdiği fix eski/uyumsuz Expo major'larına düşürüyor; `audit fix --force` uygulanmadı. Birinci dilimin mevcut web araç zinciri riskleri önceki raporda kalır.

Eğitim/oyun/Pixel Pet/market/genel topluluk/AI/Gemini/Google-Apple auth/Telegram mobil menü/route/runtime import'larında yok; source gate testi bunu kontrol eder. Arşivlenmiş web referansları mobil bundle'a dahil edilmez.

Draft PR #5 (`v1-release` hedefli) açıldı. [CI quality run 34700826073](https://github.com/Leo-P90/petid2/actions/runs/34700826073) `36e8fdf` için geçti: temiz npm ci, TypeScript, lint, Jest, Android JS export ve web export. Manuel debug APK job'u PR tetiklenmesinde tasarım gereği skipped; native APK veya cihaz QA kanıtı değildir. Master merge, production AAB, mağaza/hosting/EAS Update/Submit veya production yayın yapılmadı. Issue #4 cihaz kabul kapıları kapanmadan otomatik kapatılmamalı.
