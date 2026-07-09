# PatiDost — Fonksiyonalizm Analizi

## Fonksiyonalizm nedir (kısaca)

İsviçre/Uluslararası Tipografik Stil kökenli fonksiyonalizm; net ızgara sistemleri, disiplinli tipografik ölçek, güçlü hizalama, işlevsel olmayan süsün reddi ve "form işlevi takip eder" ilkesine dayanır. Her öğe bir görevi yerine getirmelidir; renk süsleme değil kodlama amaçlıdır; hiyerarşi ölçek ve konumla kurulur, gölge/gradyan/maskot gibi duygusal katmanlarla değil.

## Güçlü yönler — veri yoğun ve güven gerektiren ekranlar

**Sağlık ekranı** PatiDost'un fonksiyonalizmden en çok kazanacağı yer. Aşı zaman çizelgesi, ilaç switch'leri, kilo/beslenme bar grafikleri gibi öğeler zaten tablo mantığında veridir; orijinal tasarımdaki pastel ikon daireleri, gradyan hero kartı ve emoji-ağırlıklı rozetler bu veriyi "sevimli" kılar ama tarama hızını düşürür. Sıkı bir ızgara, tabular sayılarla hizalanmış istatistik hücreleri ve tutarlı kategori renk kodlaması (sağlık=belirli bir ton, eğitim=başka bir ton) kullanıcının "aşı ne zaman", "skor kaç" gibi soruları saniyeler içinde yanıtlamasını sağlar. Tıbbi içerikte güven, çoğunlukla *düzen* algısından gelir — gereksiz süsün olmaması burada bir dezavantaj değil, doğrudan güvenilirlik sinyalidir.

**Hizmet listeleri** (vet/otel/eğitmen/kuaför, sahiplenme kartları, topluluk akışı) de aynı mantıkla kazanır: liste taraması yapan bir kullanıcı için tutarlı sütun hizalaması, net meta veri (mesafe, puan, fiyat) ve tekdüze kart yapısı, renkli fakat düzensiz kart tasarımından daha hızlı karar verdirir. Profil ekranındaki "dijital kimlik kartı" fikri de aslında fonksiyonalizmle doğal olarak örtüşür — kimlik kartları zaten Swiss tasarımın klasik uygulama alanlarından biridir (havaalanı kartları, sistem pasaportları); ızgara tabanlı, mono fontlu bir kimlik kartı hem markaya hem işleve hizmet eder.

Ayrıca fonksiyonalizm erişilebilirlik açısından da avantajlıdır: net etiketler (yalnızca emoji değil), yüksek kontrast, öngörülebilir odak/hover durumları — hem yetişkin hem genç kullanıcı kitlesinde, özellikle sağlık gibi kritik akışlarda hata oranını azaltır.

## Zayıf yönler — duygusal bağ ve oyunlaştırma ekranları

Pixel-art Tamagotchi oyunu, PatiMatch swipe eşleştirmesi ve AI sohbet balonları farklı bir "iş" yapar: bağ kurma, eğlence, dopamin döngüsü. Bu ekranların referans dili zaten kendi alt-kültürlerinden gelir — Tamagotchi retro/pixel nostaljisi, Tinder'ın gradyanlı kalp butonu ve kart yığını, sohbet balonlarının yumuşak/asimetrik köşeleri. Katı ızgara ve süs reddi burada "disipline etmek" değil, **türün beklenen görsel sözleşmesini kırmak** anlamına gelir: PatiMatch'i keskin köşeli, mono fontlu, hairline-bordered kartlarla tasarlarsanız kullanıcı onu artık bir "oyun" olarak okumaz, bir form olarak okur — swipe dürtüsü kaybolur. Aynı şekilde pixel oyunun stat barları ve mağazası fonksiyonalist ızgaraya oturtulabilir (zaten sayısal), ama canvas'taki pixel sprite, zıplama animasyonları, parçacık efektleri gibi "gereksiz" görsel fazlalıklar tam olarak oyunun **değeridir** — fonksiyonalizmin reddettiği şey burada ürünün asıl satış noktasıdır.

Daha genel bir risk: PatiDost'un marka farkı "can dostu" duygusal bağıdır; tüm uygulamaya fonksiyonalizmi uygulamak, ürünü bir muhasebe/kurumsal panel gibi soğuk gösterme riski taşır ve genç/eğlence odaklı kullanıcı segmentinde retention'ı düşürebilir.

## Tavsiye: KISMEN uygulanmalı

Fonksiyonalizm PatiDost'a **hibrit bir sistem** olarak önerilir:

- **Uygula:** Sağlık, Hizmetler, Profil (kimlik kartı + zaman çizelgesi), Eğitim'in syllabus/ilerleme kısımları, Kayıt/Giriş formu, genel navigasyon ve kartlar — burada ızgara ve veri disiplini net bir kullanılabilirlik ve güven kazancı sağlar.
- **Uygulama, ayrı bir "mod" olarak koru:** Pixel oyun (canvas sahnesi, mağaza görselleri, animasyonlar), PatiMatch (kart yığını, swipe, kalp/çarpı butonları), AI sohbet balonları — bunlar kendi ifade dilini korumalı; yalnızca tipografi/renk token'ları ortak sistemle hizalanarak "aynı uygulamaya ait" hissi korunabilir.
- Bu ayrım kullanıcıya örtük bir sinyal de verir: "ciddi" ekranlarda düzen ve güven, "eğlence" ekranlarında sıcaklık ve oyun — bu zaten uygulamanın kendi ikili doğasına (sağlık verisi + bağ kurma) uygun bir tasarım stratejisidir.
