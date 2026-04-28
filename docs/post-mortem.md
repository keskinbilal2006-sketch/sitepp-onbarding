# Sitepp Post-Mortem

## Ozet

Sitepp MVP; rol bazli kullanici sistemi, talep yasam dongusu, durum gecisleri, audit trail, SLA hesaplama ve temel raporlama iceren bir onboarding projesi olarak kuruldu. Proje sonunda backend ve frontend birlikte calisir hale getirildi; Docker/PostgreSQL, Prisma migration, seed verisi, unit test, integration test ve API dokumani eklendi.

## Ne Calisti

- Controller -> service -> repository ayrimi backend tarafinda okunabilir bir yapi verdi.
- RBAC ve state machine kurallarinin merkezi tutulmasi, UI'da yakalanan durum aksiyonu hatalarini daha kolay anlamayi sagladi.
- Prisma schema ve migration akisi, veri modelini tek yerden takip etmeyi kolaylastirdi.
- Seed hesaplari ve ornek talepler manuel QA icin hizli baslangic sagladi.
- Unit testler state machine ve permission helper icin guven verdi.
- Integration test register -> login -> protected endpoint akisini gercek DB uzerinde dogruladi.

## Takildigimiz Yerler

- Docker Desktop kapali oldugunda backend `/health` calisiyor gibi gorundu, ama DB kullanan endpointler register/login sirasinda patladi.
- Seed script ilk halinde `.env` okumuyordu; `DATABASE_URL` bulunamadigi icin calismadi.
- Seed task id'leri UUID degildi. Backend detay endpointi UUID validasyonu yaptigi icin `/tasks/seed-task-resolved` gibi linkler `Request validation failed` verdi.
- Ayni saniyede paralel login denemelerinde refresh token ayni uretilip unique constraint'e takilabiliyordu. Refresh token payload'una `jti` eklenerek cozuldu.
- UI'da iptal edilmis talep icin "yetkin yok" mesaji cikiyordu. Kural dogruydu ama mesaj yanlis yonlendiriyordu.

## Neyi Farkli Yapardim

- `/health` yanina DB kontrolu yapan ayri bir `/ready` endpointi eklerdim. Boylece API ayakta mi ve DB hazir mi ayrimi net olurdu.
- Seed verilerini ilk gunden production model kurallarina birebir uygun yazardim; id alanlari UUID ise seed de UUID olmali.
- Frontend hata mesajlarini daha erken detaylandirirdim. Genel "Something went wrong" debug surecini uzatti.
- Staff atama UI'inda kullanicidan direkt UUID istemek yerine gorevli secim dropdown'u yapardim.
- Users modulu placeholder kaldigi icin admin tarafinda personel yonetimi eksik. Bunu MVP tesliminden once tamamlamak daha iyi olurdu.

## Bilinen Eksikler

- `GET /api/users` henuz `501 NotImplemented` donuyor.
- Staff atama ekrani gorevli listesinden secim yaptirmiyor; manuel UUID bekliyor.
- Frontend detay sayfasinda image render icin `next/image` yerine su an `<img>` kullaniliyor ve lint uyarisi veriyor.
- API dokumani manuel Markdown formatinda; Swagger/OpenAPI henuz yok.
- Docker Compose sadece PostgreSQL iceriyor; backend ve frontend container'lari compose'a eklenmedi.

## Ogrendiklerim

- "Backend calisiyor" demek DB'nin de calistigi anlamina gelmez; health check kapsamli dusunulmeli.
- RBAC sadece role bakmak degil, ownership ve assignee gibi instance bazli kurallari da kapsar.
- State machine kurallari UI'dan bagimsiz olarak backend service katmaninda merkezi yasamali.
- Seed verisi test verisi olsa bile gercek validasyon kurallarina uymali.
- Integration test, unit testlerin yakalamadigi auth ve DB akisi sorunlarini erken gosterir.

## Sonraki Teknik Adimlar

- Users/staff backend endpointlerini tamamla.
- Staff atama UI'ini dropdown ile kullanilabilir hale getir.
- `/ready` endpointi ile DB readiness kontrolu ekle.
- Frontend hata mesajlarini API `details` alanini kullanacak sekilde iyilestir.
- Docker Compose'a backend ve frontend servislerini ekle.
