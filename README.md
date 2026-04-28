# SITEPP

Site ve apartman talep yonetim platformu.

Bu repo, Birsav Bilisim onboarding dokumanindaki full-stack Sitepp MVP'sinin uygulama iskeletidir. Projede Express + TypeScript backend, Prisma + PostgreSQL veri katmani ve Next.js App Router frontend bulunur.

## Kapsam

- 3 rol: `RESIDENT`, `STAFF`, `ADMIN`
- E-posta/sifre ile auth, access token ve refresh token akisi
- Talep olusturma, listeleme, detay, durum guncelleme
- Task state machine ve `TaskStatusHistory` audit trail
- Kategori bazli SLA hesaplama
- Yorum, dosya yukleme ve rapor endpointleri
- Role gore dashboard, talepler, personel ve rapor ekranlari

## Teknoloji

- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod, JWT, bcrypt, multer, pino
- Frontend: Next.js, TypeScript, TanStack Query, react-hook-form, Zod, Tailwind CSS
- Lokal DB: Docker Compose ile PostgreSQL

## Kurulum

1. Environment dosyalarini hazirla:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.local.example frontend\.env.local
```

2. PostgreSQL'i baslat:

```powershell
docker compose up -d
```

3. Backend DB kurulumunu yap:

```powershell
cd backend
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run seed
```

4. Frontend paketlerini kur:

```powershell
cd ..\frontend
npm.cmd install
```

5. Uygulamalari calistir:

```powershell
cd ..\backend
npm.cmd run dev
```

```powershell
cd ..\frontend
npm.cmd run dev
```

Backend varsayilan olarak `http://localhost:4000`, frontend `http://localhost:3000` adresinde calisir.

## Docker Compose Ile Tam Calistirma

Compose dosyasi PostgreSQL, backend ve frontend servislerini birlikte tanimlar:

```powershell
docker compose up --build
```

Bu komut:
- PostgreSQL'i `localhost:5432`
- Backend'i `localhost:4000`
- Frontend'i `localhost:3000`

adreslerinde calistirir. Backend container baslarken `prisma migrate deploy` calistirir. Seed verisi istenirse ayrica calistirilmalidir:

```powershell
docker compose exec backend npm run seed
```

## Seed Hesaplari

Tum seed hesaplarinin sifresi: `Sitepp123`

| Rol | E-posta |
| --- | --- |
| ADMIN | `admin@sitepp.test` |
| STAFF | `gorevli@sitepp.test` |
| RESIDENT | `sakin@sitepp.test` |

Seed script ayrica varsayilan kategorileri ve farkli durumlarda ornek talepleri ekler.

## Kontrol Komutlari

Backend:

```powershell
cd backend
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd test
npm.cmd run test:integration
```

`test:integration` gercek lokal PostgreSQL veritabanini kullanir. Calistirmadan once `docker compose up -d`, `npm.cmd run prisma:migrate` ve `npm.cmd run seed` adimlarinin tamamlanmis olmasi gerekir.

Frontend:

```powershell
cd frontend
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Not: Windows PowerShell'de `npm` komutu execution policy nedeniyle engellenirse `npm.cmd` kullan.

## Dokumanlar

- RBAC matrisi: `docs/rbac-matrix.md`
- ER diyagrami: `docs/er-diagram.md`
- API dokumani: `docs/api.md`
- Post-mortem: `docs/post-mortem.md`
- Backend klasor notlari: `backend/README.md`
- Frontend klasor notlari: `frontend/README.md`
