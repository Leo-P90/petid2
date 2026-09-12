# V1 Dilim 2 — Issue #4 doğrulama raporu

Başlangıç `codex/v1-slice-1@44397e5`; ayrı branch `codex/v1-slice-2-expo`, hedef `v1-release`. Birinci dilim dosyaları değiştirilmedi. Kapsam belgesi `v1-release@7fe841d` ile eşitlendi. Bu dilim mobil temel ve ekran iskeletidir; tamamlanmış V1 veya production teslimi değildir.

## Uygulanan

`mobile/` Expo SDK 57 + React Native 0.86 + strict TypeScript, Expo Router dört alt sekme ve Stack. Home/profil/sağlık/kayıp-yaralı/acil/PatiMatch/sahiplendirme liste-detay React Native bileşenleridir; web uygulamasını WebView ile sarmalama veya web bundle import'u yoktur.

Tema AsyncStorage'da kalır; paralel yazma kilidi ve saklama hatası mesajları vardır. Native Appearance ve StatusBar temaya bağlıdır. Safe-area, 48dp düğmeler, scroll, keyboard resize/avoidance ve Router Android back-history yapılandırıldı.

Fotoğraf/foreground konum/dosya/telefon-WhatsApp arayüzleri gerçek Expo/RN SDK adaptörlerine bağlıdır. Kullanıcı işlem başlatmadan izin istenmez; red/kalıcı red/iptal/hata ayrıdır. GPS kapalı veya 20 saniye yanıt yoksa hata gösterilir. Galeri beş fotoğraf, dosya 10MB sınırı; hayvan kimliğine göre ayrım. Kamera/mikrofon/background location yoktur.

Merkezi app.config.ts, Android/iOS dev-preview-production kimlikleri, ikon/splash yolları ve EAS profilleri hazır. Kimlikler geçici; marka sahipliği ayrıca doğrulanmalı. Varlıklar Expo şablonundan geçici ikon/splash'tır. Secrets, EAS projectId, production keystore veya store hesabı eklenmedi. Yerel debug APK ve yetkili kullanıcı EAS development/preview adımları mobile/README.md'de; production build/yayın adımları çalıştırılmadı.

## Geçen kontroller

- TypeScript `npm run typecheck` ve sıfır uyarılı `npm run lint`.
- Mobil Jest: 6 suite, 34 test (ilk 28 test korunur). Service success/cancel/denial/errors, gerçek adaptör sözleşmeleri (mock native SDK), GPS timeout, config/EAS/runtime dışlama, aynı tür keşif, beş fotoğraf sınırı, profil fotoğraf ayrımı, tema disk yükleme/yazma hatası ve ekran etkileşimleri; ek IME/focus-scroll, profil odak/kaydet/hayvan ayrımı, marka tokenları ve AA kontrast regresyonları.
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

12 Eylül 2026: Kullanıcı Android Studio emülatörünü hazırladı. `emulator-5554`, Android API **37**, Google 16KB **x86_64**, fiziksel 1080×2400 / 420dpi. İlk boot tamamlandıktan sonra APK kurulumu başarılı. Bu native emülatör testi fiziksel telefon veya iOS QA yerine sayılmaz; API 35/36 stabil Android ayrıca doğrulanmalı.

### Geçen native emülatör kontrolleri

- Development client / yerel Metro bağlantısı ve MainActivity cold start başarılı; tekrar process kapat/aç başarılı. Son uygulama filtreli `ReactNativeJS:E / AndroidRuntime:E` logcat boş.
- Dört sekme ve profil, sağlık, kayıp/yaralı, acil, PatiMatch, sahiplendirme liste/detay açıldı. PatiMatch demo opt-in ve beğen sonrası sonraki aynı-tür aday görüldü. Sahiplendirme detayından Android geri listeye döndü. Sağlıktan profil/hayvan seçimine gidip geri dönüldü.
- Koyu tema `am force-stop` + yeniden cold start sonrasında korundu. Native status/navigation bar koyu görünüm ve ekran sınırları görsel olarak kontrol edildi.
- Galeri gerçek Android sistem picker'ı ile yerel test PNG seçimi ve iptali geçti. Mia fotoğrafı 1/5, Atlas 0/5; iptalde değişiklik yok mesajı. Bu imajın modern photo picker'ı ayrıca galeri izin diyaloğu göstermedi; OS galeri ret/kısıtlı izin yolları geçti sayılmaz.
- Belge picker gerçek Android DocumentsUI'da açıldı, geri ile iptal mesajı ve `petid-qa-photo-a.png` seçimi başarılı. Mia dosyası seçili, Atlas'a geçince dosya görünmedi. Upload yapılmadı. PDF/10MB/error sınırları yalnızca mevcut mock testlerdedir.
- Foreground konum OS diyaloğunda **Don't allow** sonrası tekrar izin verilebilir ret mesajı görüldü. Sonra **While using the app** verildi. Google Location Accuracy ek veri işleme onayı **No thanks** ile reddedildi; uygulama GPS/bağlantı hatası ve manuel giriş mesajı gösterdi. Google onayı kullanıcı adına kabul edilmedi.
- Manuel 41.01 / 29.02 önizleme ve `Emulator-QA` açıklamasıyla yayınsız demo taslağı oluştu; gerçek ilan yayınlanmadı.
- Test numarasıyla `tel:` Android telefon ekranını açtı; arama düğmesine basılmadı, arama/mesaj yapılmadı. WhatsApp native uygulaması ve dış ağ hata senaryosu doğrulanmadı.
- Native 360/390/430dp ana ekran boyutları geçici `wm size` ile kontrol edildi; dört sekme görünür, yatay taşma gözlenmedi. Tema düğmesi yüksekliği 126px / 2.625 = **48dp**. Alt içerik kaydırılabilir. Ekran boyutu tekrar fiziksel boyuta döndürüldü. Dev-client Tools overlay'i küçük ekranda başlık üstüne gelebilir; preview/release UI kontrolü ayrı yapılmalı.
- Gboard stylus ilk eğitimi normal klavye testinden ayrıldı. Normal sanal klavyede ilk geri klavyeyi kapatıp profili korudu, ikinci geri ana ekrana döndü. Test için değiştirilen emülatör `show_ime_with_hard_keyboard=0` ve varsayılan stylus ayarı geri yüklendi.

### Açık native bulgular / kabul kapıları

1. **Önceki klavye bulgusu giderildi:** İlk QA'da normal Gboard profili örtüyordu (`android-keyboard-finding.png`). PR #5 son talimatında ortak Screen, pencere koordinatlı IME inset ve odak alanına otomatik scroll ile değiştirildi. Profil etiketi/input/kaydet grubu normal Gboard ve 360×640dp / %130 yazı ölçeğinde görünür kaldı. Klavye açıkken kaydetme/kaydırma ve geriyle kapatma geçti. Görsel ve teknik kanıtlar aşağıdaki restorasyon bölümündedir.
2. **Otomatik GPS başarı sonucu açık:** Foreground izin verildi fakat ek Google Location Accuracy onayı verilmedi. Kullanıcı açık kapı raporlanmasını ve son toplu kontrolde tekrar test edilmesini seçti. İzin grant'i, başarılı koordinat edinimi demek değildir.
3. Fiziksel Android ve stabil API 35/36; gesture/predictive root back, %130 üzeri sistem fontu, çentik/3-button kombinasyonu, fotoğraf OS kalıcı ret/kısıtlı erişim, picker process-death, PDF/gerçek URI açma/10MB cihaz sınırı, WhatsApp/dış ağ hata yolu ve iOS QA açık. Tüm native kabul kriterleri tamamlandı veya Issue #4 kapanabilir iddiası yoktur.

## PR #5 — klavye ve PetID tasarım restorasyonu

Son @codex talimatı mevcut `codex/v1-slice-2-expo` üzerinde uygulandı. Web CSS/ekranları değiştirilmedi. `preserved-shell.css` kök/.phone.dark tokenları, pet-pill, hero, mod-card ve `shell.css` yüzen/aktif nav desenleri native View/Text/Pressable bileşenlerine taşındı; WebView veya ertelenmiş oyun/eğitim modülü eklenmedi.

Renklerin tek kaynağı `mobile/src/core/brand-tokens.json`, tema erişimi `theme.ts`. JSON hem Expo config hem RN tarafından okunur; config'in TS alt modül import kısıtı giderildi. #0EA574 marka/dekorasyon/seçim sınırı, #0B8560 okunabilir beyaz etiketli ana işlem/hero/aktif sekme; eski #6B7B75 korunur, küçük yazı AA karşılığı açıkta #62726C, koyuda #96A69F. 20dp kartlar, yumuşak sınır/gölge, renk kodlu modüller, pati/hayvan karakteri, yeşil dijital kimlik ve yatay seçili hayvan pill'leri geri geldi. Dört sekme değişmedi; bar 12dp kenar boşluğu ve safe-area üzerinde yüzer, yazı ölçeğine göre yüksekliği artar. Tema düğmesi 48dp; uzun demo açıklaması her ekranın ikincil alt bilgi alanına indirildi.

Klavye: adjustResize korunur; `keyboardDidShow/Hide` ile ölçülen dış pencere sınırı/IME üst çizgisi yalnızca gerçek örtüşme kadar inset verir (zaten resize olmuşsa ikinci padding yok). Field odaklanan etiket/input bölgesini kayıt eder; profil ref'i kaydet düğmesini de içerir. Inset/layout sonrası otomatik scroll hesaplanır, scroll offset takip edilir; `keyboardShouldPersistTaps=handled`, `keyboardDismissMode=none` ile açık klavyede kaydetme/kaydırma mümkündür. Listener/animation-frame unmount temizliği vardır. [React Native klavye API'si](https://reactnative.dev/docs/keyboard), [yerleşim ölçümü](https://reactnative.dev/docs/the-new-architecture/layout-measurements).

Gerçek Gboard küçük ekran ölçümü: 945×1680 / 420dpi = 360×640dp, font_scale 1.3. IME üstü 895px; etiket 318–384px, input 399–542px, kaydet düğmesi 668–809px; üçü de görünür. Ekran/yazı ölçeği sonra eski ayara döndürüldü.

Tekrar native galeri PNG seçimi ve Mia 1/5–Atlas 0/5 ayrımı; DocumentsUI test PNG seçimi ve hayvan dosya ayrımı geçti. Ekran/font ayarı activity yeniden üretiminden sonra Expo dev-client photo picker bir kez unregistered ActivityResultLauncher hatası verdi; cold start ile gerçek seçici çalıştı. Bu SDK/configuration-change kurtarma bulgusu açık, gizlenmedi; geçici yalnızca-QA hata loglaması kaynaklara taşınmadı. Debug Tools balonu testte tema düğmesinden uzaklaştırıldı; release arayüzünün parçası değildir.

Önce/sonra ve eski web referans ekranları: [PR #5 QA görselleri](docs/qa/pr5-design-keyboard/README.md). Otomatik GPS başarı testi kullanıcı kararıyla açık; yeni PR, merge veya production yayın yapılmadı.

Son renk config'iyle native prebuild ve Gradle `:app:assembleDebug` tekrar başarılı: 5m46s, 487 task (53 executed, 434 up-to-date). İlk config denemesi TS alt modül import'unda hata verdi; ortak JSON ile düzeltildi. İlk temiz native derlemede Clang çöktü; max-workers=1 ile tekrar geçti. SDK/Gradle deprecation ve CMake uzun obje-yolu uyarıları sürüyor, son derleme başarısız değil. Güncel development APK emülatöre `install -r` ile kuruldu. 154239145 byte; SHA-256 `dd3a7c9a1f91474d066dc3aa37d513b5cd09961882021728bc5d9266ae8a75eb`, aynı Android Debug sertifikası doğrulandı. Yerel artifact `petid-pr5-development.apk`; Metro gerektirir, bağımsız preview/production değildir, git'e eklenmez.

## Bilinen prototipler ve riskler

Son APK kurulumu ardından Metro bağlantısı bir kez boş açılış ekranında bekledi; geliştirme sunucusu temiz önbellekle yeniden başlatılınca bundle yüklenip açık/koyu ana ekran çalıştı. Ardından son APK ile tekrar cold start ve koyu tema kalıcılığı geçti. Bu development-server bağımlılığıdır; bağımsız preview açılışı doğrulanmış sayılmaz. Yenileme bandı olan ilk görseller kullanılmadı, temiz son paket görselleri yeniden alındı.

Backend bağlantısı yok; ekranlar açıkça demo modundadır. Tema dışındaki değişiklikler oturumluk. Hesap/auth, gerçek kalıcı profil/sağlık/private dosya upload-download, paylaşılabilir/iptal edilebilir QR, canlı interaktif harita/ihbar/sahip onayı/arşiv backend'i, gerçek PatiMatch eşleşme/mesaj/moderasyon ve sahiplendirme CRUD/başvuru/iletişim sonraki dilimdir. Harita şu an koordinat önizleme iskeletidir. Örnek klinik iletişimi, açık/nöbetçi iddiası ve gerçek sahiplendirme kartı iddiası yoktur.

Android picker activity/process ölümü pending-result kurtarması henüz uygulanmadı. GPS timeout JS beklemesini sınırlar; Expo tek seferlik native konum isteğinin iptal API'si yoktur. %130 üzeri büyük sistem fontu ve fiziksel/stabil Android status/navigation bar kombinasyonları QA kapısında açıktır.
Expo SDK'nın transitif `expo-dom-webview` native/DOM interop bağımlılığı vardır. Bu, PetID web prototipini sarmalama değildir; tüm PetID ekranları RN bileşenleridir ve uygulama kaynaklarında WebView/DOM import'u yoktur. Source-gate testi uygulama kaynaklarını denetler, tüm vendor SDK bileşenlerinin fiziksel olarak yokluğunu iddia etmez.

Mobil npm audit: 14 orta, 0 yüksek/kritik. Başlıca Expo iOS build-tool xcode/uuid ve Router query-string/decode-uri-component transitif uyarıları. npm'nin önerdiği fix eski/uyumsuz Expo major'larına düşürüyor; `audit fix --force` uygulanmadı. Birinci dilimin mevcut web araç zinciri riskleri önceki raporda kalır.

Eğitim/oyun/Pixel Pet/market/genel topluluk/AI/Gemini/Google-Apple auth/Telegram mobil menü/route/runtime import'larında yok; source gate testi bunu kontrol eder. Arşivlenmiş web referansları mobil bundle'a dahil edilmez.

Draft PR #5 (`v1-release` hedefli) açıldı. [CI quality run 34700826073](https://github.com/Leo-P90/petid2/actions/runs/34700826073) `36e8fdf` için geçti: temiz npm ci, TypeScript, lint, Jest, Android JS export ve web export. Manuel debug APK job'u PR tetiklenmesinde tasarım gereği skipped; native APK veya cihaz QA kanıtı değildir. Master merge, production AAB, mağaza/hosting/EAS Update/Submit veya production yayın yapılmadı. Issue #4 cihaz kabul kapıları kapanmadan otomatik kapatılmamalı.
