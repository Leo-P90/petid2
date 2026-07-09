# PatiMatch'i Öne Çıkarma — Seçenek B: Yapısal / Büyük Değişiklik

## Bağlam

PatiDost'un görsel dili (yeşil #0EA574, 20px radius, yumuşak gölge, hap chip/buton, emoji ikonografi) sabit kalıyor — bu bir yeniden tasarım değil. Tek hedef: PatiMatch'i (kedi-kedi / köpek-köpek çiftleştirme eşleşmesi) mevcut üç dolaylı erişim yolundan (chip satırındaki 9 chip'ten biri, Hizmetler'e gömülü promo kart, AI aramada anahtar kelime) çıkarıp gerçekten "öne çıkan" bir konuma taşımak. Aşağıda üç somut yapısal öneri, her biri için artı/eksi, uygulama zorluğu ve dürüst bir ürün değerlendirmesi var.

## Seçenek 1 — Alt navigasyona 6. slot eklemek

**Ne:** Mevcut 5 butonu (Ana Sayfa, Eğitim, AI, Sağlık, Hizmetler) koruyup yanına 6. bir "PatiMatch" butonu eklemek.

**Artı:** Her ekrandan tek dokunuşla erişim; en yüksek olası görünürlük; hiçbir mevcut özellik feda edilmiyor.

**Eksi:** Alt nav zaten dolu — 4 kenar buton (62px genişlik) + ortada 58px'lik yükseltilmiş AI dairesi. Telefon çerçevesinin iç genişliği ~380px; 6. bir buton eklemek dokunma hedeflerini daraltıyor, kalabalık ve dengesiz bir nav'a yol açıyor, farklı ekran genişliklerinde taşma riski taşıyor. Daha önemlisi: alt nav "her gün, her kullanıcı tarafından" kullanılan çekirdek işlevlere ayrılmış bir kaynak. PatiMatch niş bir özellik — kısırlaştırılmış hayvanı olan, üretmek istemeyen veya kedisi/köpeği erişkin olmayan kullanıcıların büyük bir kısmı bu butonu hiç kullanmayacak ama her ekranda görecek.

**Uygulama zorluğu:** Düşük-orta (CSS flex ayarı + JS `go()` genişletmesi).

**Dürüst görüş:** Reddediyorum. Kalıcı, evrensel nav real-estate'ini niş bir özelliğe vermek, dokunma hedefi kalitesini düşürürken çekirdek işlevlerin (Sağlık, Eğitim) göreli önemini de sulandırıyor.

## Seçenek 2 — Mevcut bir sekmeyi PatiMatch ile değiştirmek

**Ne:** 5 slottan birini (örn. Sağlık veya Eğitim) PatiMatch ile değiştirmek, ya da ortadaki AI butonunu ikili işlev (tap = AI, uzun bas = PatiMatch) yapmak.

**Hangi sekme feda edilebilir?** Sağlık asla olamaz — aşı/ilaç takibi hayati önemde, günlük kullanım. Eğitim de çekirdek katılım döngüsünü (streak, günlük görev, 12 kademelik program) taşıyor; kaldırılırsa retention'a zarar verir. Hizmetler zaten PatiMatch'i barındırıyor ve geniş bir hub (vet, otel, sahiplendirme, topluluk) — onu tamamen kaldırmak orantısız. Ortadaki AI butonunu gizli bir uzun-basma jestiyle ikili işlev yapmak ise keşfedilebilirlik sorunu yaratır: uygulamanın başka hiçbir yerinde böyle bir gizli etkileşim yok, kullanıcıların bunu keşfetmesi beklenemez ve tutarsız bir etkileşim modeli oluşturur.

**Uygulama zorluğu:** Düşük (metin/ikon değişimi) ama ürün riski yüksek.

**Dürüst görüş:** Reddediyorum. Hiçbir mevcut sekme, niş bir özelliğe feda edilmeye değmez; bu, günlük aktif kullanımı olan bir işlevi feda ederek nadiren kullanılacak bir işlevi öne çıkarmak anlamına gelir — net kullanıcı değeri kaybı riski, kazanılandan büyük.

## Seçenek 3 — Ana sayfanın en üstüne (hero alanına) taşımak

**Ne:** Hero-search'ün hemen altına, sayfanın en görünür bölgesine (above-the-fold) kendine ait, markaya uygun pembe-kırmızı gradyanlı bir PatiMatch tanıtım kartı yerleştirmek. Alt nav'a dokunulmuyor.

**Artı:** PatiMatch'i "10 chip'ten biri" statüsünden çıkarıp uygulama açılır açılmaz görülen bir üst-düzey kart yapıyor — gerçek bir "öne çıkarma". Nav yapısını bozmuyor, hiçbir mevcut özelliği feda etmiyor, tüm kullanıcı tabanına dayatmıyor (istemeyen kullanıcı aşağı kaydırıp göz ardı edebilir, chip satırındaki tekrarını kaldırdık ki gürültü artmasın). Düşük risk: yalnızca ana sayfa düzeni değişiyor, geri alınabilir, mevcut ekranların hiçbiri etkilenmiyor. Hizmetler'deki ikincil giriş noktası da korunuyor (çoklu keşif yolu iyi bir örüntü).

**Eksi:** PatiMatch artık Hizmetler/Eğitim/Sağlık gibi günlük kullanılan özelliklerle aynı üst-düzey görünürlüğü paylaşıyor; bu, ana sayfanın "hero search + net iş listesi" sadeliğini bir miktar karmaşıklaştırıyor. Niş bir kullanıcı segmentine hitap eden bir kartın en değerli alanı (above-the-fold) kaplaması, kısırlaştırılmış hayvan sahipleri için "alakasız gürültü" olarak algılanabilir. Bunu azaltmanın olgun yolu — kartı kapatılabilir yapmak veya hayvanın kısırlaştırma durumuna göre koşullu göstermek — bu prototipin kapsamı dışında, ama gerçek üründe ele alınmalı.

**Uygulama zorluğu:** Düşük-orta (yeni kart bileşeni + `renderPromo()` fonksiyonu, hero düzeninde küçük kaydırma).

**Dürüst görüş:** Üç seçenek arasında en dengeli olan bu. Nav'ı bozmadan, hiçbir çekirdek özelliği feda etmeden gerçek bir görünürlük artışı sağlıyor.

## Kademeli/düşük riskli alternatif değerlendirmesi

Dürüst olmak gerekirse: PatiMatch'in kitlenin önemli bir kısmına hitap etmeyen niş bir özellik olduğu gerçeği göz önüne alındığında, en doğru uzun vadeli ürün kararı muhtemelen **kademeli ve kişiselleştirilmiş** bir yaklaşım olurdu — kartı yalnızca kısırlaştırılmamış/erişkin hayvanı olan kullanıcılara göstermek, ya da chip'in görsel ağırlığını hafifçe artırıp (renk/rozet) nav ve ana sayfa yapısını hiç değiştirmemek. Bu, "büyük yapısal değişiklik her zaman daha iyi ürün kararı değildir" ilkesinin somut bir örneği. Ancak bu görev özellikle yapısal/büyük değişiklik yaklaşımını araştırmayı istediği için, üç yapısal seçenek içinde en az riskli ve en dengeli olan **Seçenek 3'ü** seçip uyguladım; gerçek üründe bunun üstüne koşullu görünürlük/kapatılabilirlik eklenmesini öneririm.

## Sonuç ve Öneri

**Seçilen ve uygulanan seçenek: Seçenek 3 — Ana sayfanın hero alanına taşıma.**

Nedenleri:
1. Nav slotlarına dokunmadan gerçek bir görünürlük sıçraması sağlıyor.
2. Hiçbir çekirdek özelliği (Sağlık, Eğitim, Hizmetler) feda etmiyor.
3. Düşük uygulama riski, kolay geri alınabilirlik.
4. Chip satırındaki tekrarı kaldırarak bilgi mimarisini sadeleştiriyor, aynı özelliği iki kez göstermiyor.
5. Hizmetler'deki ikincil kartı koruyarak çoklu keşif yolunu (redundant discovery) sürdürüyor.

Örnek dosyada (`patimatch-oncikar-B-yapisal.html`) uygulanan değişiklik: hero-search'ün hemen altına, pembe-kırmızı gradyanlı (`#F472B6→#E11D48`, mevcut PatiMatch marka rengiyle birebir tutarlı), `var(--radius)` ve `var(--shadow)` kullanan yeni bir `.match-promo` kartı eklendi. Kart, seçili evcil hayvana göre dinamik aday sayısı gösteriyor (`renderPromo()`), tıklanınca PatiMatch ekranını açıyor. Chip satırından PatiMatch chip'i kaldırıldı (artık üstte kendi kartı var, tekrar gereksiz). Alt navigasyon bilinçli olarak **değiştirilmedi** — 5 buton, aynı sıra, aynı işlev.
