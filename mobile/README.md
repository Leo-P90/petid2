# PetID mobil temel — Issue #4

Expo SDK 57 / React Native / TypeScript / Expo Router. `app/` web prototipi yalnızca referanstır; mobil runtime DOM, WebView, Vite bundle veya premium override yüklemez.

## Başlangıç ve mimari

Başlangıç: `codex/v1-slice-1` (`44397e5`, draft PR #3). Yeni branch: `codex/v1-slice-2-expo`. Güncel Expo kapsam belgesi `v1-release@7fe841d` ile eşitlendi; birinci dilim değişiklikleri korundu.

- `src/app/(tabs)`: Ana Sayfa, Sağlık, PatiMatch, Hizmetler.
- Root Stack: profil, kayıp/yaralı, acil veteriner, sahiplendirme liste/detay.
- `state/app-state.tsx`: merkezi tema ve oturumluk demo hayvanlar. AsyncStorage yalnızca tema saklar.
- `core/services.ts`: bağımlılık enjekte edilebilir başarı/iptal/izin reddi/hata sözleşmeleri.
- `services/native.ts`: expo-image-picker, expo-location, expo-document-picker, React Native Linking adaptörleri.
- SafeAreaProvider + SafeAreaView; Stack kendi üst safe-area/header alanını yönetir. Alt sekmeler cihaz alt inset'ini kullanır. En az 48dp düğmeler, sarılan metin, kaydırılabilir 360–430dp dikey ekranlar.
- Android geri: Router Stack pop, sekmelerde history, kökte işletim sistemi çıkışı. Geri tuşunu yutan özel listener yok. Android resize klavye, iOS KeyboardAvoidingView, kaydırarak klavye kapatma.

## Yerel geliştirme ve kontroller

Node.js 24 LTS ve npm kullanın. Repo kökünden:

```powershell
cd mobile
npm ci
npm run typecheck
npm run lint
npm test
npx expo-doctor
npm run build:android:js
npm run build:web
npx expo start --dev-client
```

Hermes/Metro Android JS export'u APK değildir. Web preview yalnızca hızlı geliştirme kontrolüdür, Android cihaz kabul testi yerine geçmez. Statik web çıktısı `dist/web` içinde; demo sahiplendirme detayları generateStaticParams ile üretilir. Hiçbir preview production hosting'e gönderilmez.

## Android development build / debug test APK

Android Studio, JDK 17+ (bu ortamda JDK 21), SDK 36, Build Tools 36.0.0/35.0.0, NDK 27.1.12297006 ve CMake 3.22.1 gerekir. Android SDK lisanslarını yetkili kullanıcı Android Studio'da kabul etmelidir. Yeni lisans onayı veya production keystore oluşturmayı otomatikleştirmeyin.

PowerShell'de yolları kendi kurulumunuza göre ayarlayın:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = 'C:\Users\YOUR_USER\AppData\Local\Android\Sdk'
npx expo prebuild --platform android --no-install
Push-Location android
.\gradlew.bat assembleDebug --no-daemon
Pop-Location
# Yerel development client APK:
# android/app/build/outputs/apk/debug/app-debug.apk
& "$env:ANDROID_HOME\platform-tools\adb.exe" devices
& "$env:ANDROID_HOME\platform-tools\adb.exe" install -r android/app/build/outputs/apk/debug/app-debug.apk
npx expo start --dev-client
```

`assembleDebug` yalnızca Android'in debug sertifikasını kullanır; production imzalama anahtarı gerekmez. Native üretimler, debug keystore, APK/AAB, credentials.json ve ortam dosyaları gitignore içindedir. Cihaz/emülatörü Android Studio'dan açın; geliştirme sunucusuna erişebilmelidir. USB cihazda gerektiğinde `adb reverse tcp:8081 tcp:8081` kullanın. Geliştirme sunucusu 8081 portunu kullanır; başka preview sunucusunu önce kapatın.

Debug development client Metro gerektirir. Bağımsız, yalnızca test için preview APK farklıdır:

```powershell
# Yetkili kullanıcı EAS hesabı/proje bağlantısını ve test signing seçimini tamamladıktan sonra:
npx eas-cli build --platform android --profile development
# veya dahili test için bağımsız APK:
npx eas-cli build --platform android --profile preview
```

Bu görevde EAS hesabı bağlanmaz, signing anahtarı oluşturulmaz, cloud build gönderilmez. Windows'ta EAS local build desteklenmez; yerel Android Gradle debug yolu kullanılır. `production` EAS profili yalnızca yapılandırmadır: çalıştırmayın, production AAB üretmeyin, EAS Update/Submit veya mağaza/hosting yayınlamayın.

## Konfigürasyon, environment ve varlıklar

`app.config.ts` tek kaynak; `APP_VARIANT=development|preview|production` kimlikleri sırasıyla `com.petid.app.dev`, `com.petid.app.preview`, `com.petid.app` yapar. iOS aynı bundle identifier'ları kullanır. Kimliklerin marka/mağaza sahipliği yayın öncesinde ayrıca onaylanmalı. EAS projectId/owner/credentials veya gizli API anahtarı uydurulmadı.

İkon `assets/images/icon.png`, Android ön plan `android-icon-foreground.png`, splash `splash-icon.png`, web favicon `favicon.png` aynı klasördedir. Bunlar Expo şablonunun **geçici** görselleridir; mağaza için PetID marka varlıkları ve cihaz splash QA gereklidir.

Şu an environment API anahtarı gerektirmez, backend bağlantısı yoktur. `EXPO_PUBLIC_*` değerlerinin bundle'da görünür olduğunu unutmayın; sır, service-role veya signing parolası buraya konmaz. Tema diskte, fotoğraf/dosya URI'leri yalnızca bellektedir.

## İzinler ve dış uygulamalar

İzinler açılışta istenmez; kullanıcı işlem başlatınca yalnızca foreground konum ve galeri izni istenir. Kamera, mikrofon ve background location yoktur. İzin reddinde tekrar denenebilir/ayarlar gerekli mesajları ayrıdır. Android/iOS kısıtlı galeri erişimi cihazda test edilmelidir.

Fotoğraflar en fazla beş, hayvan kimliğine bağlıdır. Dosya picker PDF/görsel ve en fazla 10MB kabul eder; gerçek upload/download veya veteriner doğrulaması yoktur. Android'in activity yok etmesi/picker pending-result kurtarması bu dilimde uygulanmadı.

Telefon/WhatsApp yalnızca kullanıcının kendi doğruladığı, ülke kodlu numara için açılır. Otomatik arama/mesaj göndermez. Doğrulanmamış örnek klinik numarası, açık/nöbetçi iddiası yoktur. Dış uygulama/ağ hataları ekranda gösterilir.

## Açık prototip sınırları

Tüm ekranlarda demo/sunucu bağlı değil uyarısı var. İlanlar gerçek yayınlanmaz; harita koordinat önizleme bağlantı noktasıdır, interaktif harita değildir. Sağlık kayıt yazma, private upload/download, kimlik QR paylaşımı/iptal ve hesap oturumu sonraki dilimdedir. PatiMatch aynı tür ve hayvana özel katılım/beğen-geç demosudur; karşılıklı eşleşme/mesaj/blok/şikayet backend'e kadar açılmaz. Sahiplendirme liste/detayı açıkça örnektir; gerçek ilan CRUD/başvuru/iletişim yoktur.

Eğitim/görev/oyun/Pixel Pet/market/genel topluluk/AI/Google-Apple auth/Telegram uygulama route'u, runtime import'u veya SDK çağrısı yoktur. PetID ekranlarında WebView/DOM wrapper kullanılmaz. Expo SDK'nın transitif expo-dom-webview geliştirme/DOM interop modülü bağımlılık ağında vardır; PetID web prototipini yüklemez ve uygulama kaynağında import edilmez. Birinci dilimin kaynakları git geçmişinde ve web referansında korunur.

## CI

`.github/workflows/mobile.yml` v1-release hedefli PR'larda npm ci, TypeScript, sıfır uyarılı lint, Jest, Android JS export ve web export çalıştırır. EAS veya production işlemi yoktur. Workflow manuel çalıştırılırsa ek debug APK job'u native prebuild + assembleDebug yapar ve APK'yı yedi gün saklanan test artifact'i olarak yükler; cihaz testi ayrıca yapılmalıdır. Yeni workflow'lar repo varsayılan branch'ine alınmadan workflow_dispatch görünmeyebilir; bu görev master'a merge etmez.

## Cihaz kabul kontrol listesi — henüz geçildi sayılmaz

Android development client veya preview APK ile:

1. Soğuk açılış ve Metro/bağımsız preview davranışı; uygulama crash/logcat kontrolü.
2. Dört sekme + tüm Stack ekranları; detaydan geri, sekme geçmişi, kökte geri, gesture/predictive back.
3. 360/390/430dp, büyük sistem yazısı, ekran çentiği, gesture/3-button alt navigasyon; görünür kontrol erişimi.
4. Klavyeyle profil/ilan/telefon formu, kapatma ve geri tuşu; kaydırma ve taşma.
5. Galeri izin ver/reddet/kalıcı reddet/kısıtlı erişim/iptal/iki fotoğraf/sil; iki hayvanın fotoğrafları karışmamalı.
6. Konum izin ver/reddet/kalıcı reddet/GPS kapalı; manuel koordinatlar ve taslak, arka plan izni istenmemeli.
7. PDF/görsel dosya seç/iptal/erişim hatası/10MB sınırı; hayvan ayrımı; cihazda dosya URI erişimi.
8. Tema değiştir, uygulamayı öldür/yeniden aç; disk yazma hatası görünür olmalı.
9. Kendi test numaranızla telefon/WhatsApp uygulaması ve uygulama kurulu değil/ağ kapalı; gerçek kişiye arama/mesaj göndermeyin.
10. PatiMatch katılım/beğen/geç ve tür ayrımı; sahiplendirme liste/detay; gerçek eşleşme/başvuru/yayın iddiası olmamalı.

iOS yapılandırması hazırdır; Windows'ta iOS native derleme veya cihaz QA doğrulanmaz.

Kaynaklar: [Expo APK](https://docs.expo.dev/build-reference/apk/), [yerel native build](https://docs.expo.dev/guides/local-app-overview/), [izinler](https://docs.expo.dev/guides/permissions/), [konum](https://docs.expo.dev/versions/latest/sdk/location/), [galeri](https://docs.expo.dev/versions/latest/sdk/imagepicker/), [dosya seçimi](https://docs.expo.dev/versions/latest/sdk/document-picker/).
