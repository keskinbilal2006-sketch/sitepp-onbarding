# SITEPP API Dokumani

Base URL: `http://localhost:4000`

Tum protected endpointlerde header gerekir:

```http
Authorization: Bearer <accessToken>
```

Hata formati:

```json
{
  "error": "ValidationError",
  "message": "Request validation failed.",
  "statusCode": 400,
  "details": {}
}
```

## Health

| Method | Path | Auth | Aciklama |
| --- | --- | --- | --- |
| GET | `/health` | Hayir | API ayakta mi kontrol eder. DB kontrolu yapmaz. |
| GET | `/ready` | Hayir | API ve PostgreSQL baglantisi hazir mi kontrol eder. |

## Auth

| Method | Path | Auth | Aciklama |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Hayir | Yeni `RESIDENT` kullanici olusturur ve token dondurur. |
| POST | `/api/auth/login` | Hayir | E-posta/sifre ile giris yapar. |
| POST | `/api/auth/refresh` | Hayir | Refresh token ile yeni token seti uretir. |
| POST | `/api/auth/logout` | Hayir | Refresh token'i revoke eder. |
| GET | `/api/auth/me` | Evet | Mevcut kullaniciyi dondurur. |

Register body:

```json
{
  "email": "sakin@example.com",
  "password": "Sitepp123",
  "name": "Ayse Sakin",
  "apartmentNo": "A-12",
  "phone": "5550000001"
}
```

Login body:

```json
{
  "email": "sakin@example.com",
  "password": "Sitepp123"
}
```

## Categories

| Method | Path | Auth | Roller | Aciklama |
| --- | --- | --- | --- | --- |
| GET | `/api/categories` | Evet | Tumu | Kategori listesini dondurur. |

Kategori create/update/delete endpointleri MVP'de henuz uygulanmadi.

## Tasks

| Method | Path | Auth | Roller | Aciklama |
| --- | --- | --- | --- | --- |
| GET | `/api/tasks` | Evet | Tumu | Role-scoped talep listesi. |
| POST | `/api/tasks` | Evet | `RESIDENT`, `ADMIN` | Yeni talep olusturur. |
| GET | `/api/tasks/:id` | Evet | Yetkili kullanici | Talep detayi, stepper verisi, yorumlar ve ekleri dondurur. |
| PATCH | `/api/tasks/:id/status` | Evet | State machine'e gore | Talep durumunu degistirir ve history kaydi olusturur. |

Liste query:

```text
page=1&pageSize=10&status=OPEN&priority=HIGH&categoryId=<uuid>&search=asansor
```

Create body:

```json
{
  "categoryId": "00000000-0000-0000-0000-000000000000",
  "priority": "HIGH",
  "description": "Merdiven lambasi yanmiyor ve kontrol edilmesi gerekiyor.",
  "apartmentNo": "A-12"
}
```

Status update body:

```json
{
  "status": "ASSIGNED",
  "assignedStaffId": "00000000-0000-0000-0000-000000000000",
  "note": "Elektrik ekibine yonlendirildi."
}
```

Durumlar:

```text
OPEN, IN_REVIEW, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED, REOPENED
```

## Comments

| Method | Path | Auth | Roller | Aciklama |
| --- | --- | --- | --- | --- |
| POST | `/api/comments` | Evet | Talebe erisebilenler | Talebe yorum ekler. |
| GET | `/api/comments/task/:taskId` | Evet | Talebe erisebilenler | Talep yorumlarini listeler. |

Create body:

```json
{
  "taskId": "00000000-0000-0000-0000-000000000000",
  "body": "Kontrol edildi, parca bekleniyor."
}
```

## Attachments

| Method | Path | Auth | Roller | Aciklama |
| --- | --- | --- | --- | --- |
| GET | `/api/attachments/task/:taskId` | Evet | Talebe erisebilenler | Talep eklerini listeler. |
| POST | `/api/attachments/task/:taskId` | Evet | Talebe erisebilenler | Talebe 1-3 dosya yukler. |
| POST | `/api/attachments/comment/:commentId` | Evet | Yoruma erisebilenler | Yoruma 1-3 dosya yukler. |

Upload istekleri `multipart/form-data` kullanir. Alan adi: `files`.

## Reports

| Method | Path | Auth | Roller | Aciklama |
| --- | --- | --- | --- | --- |
| GET | `/api/reports/overview` | Evet | `ADMIN` | Kategori dagilimi, SLA performansi ve cozum sureleri. |

Query:

```text
month=4&year=2026
```

## Users

| Method | Path | Auth | Roller | Aciklama |
| --- | --- | --- | --- | --- |
| GET | `/api/users` | Evet | `ADMIN` | Kullanici listesini dondurur. Staff atama ve personel ekraninda kullanilir. |

Query:

```text
role=STAFF&search=ali&page=1&pageSize=50
```

Response item alanlari:

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "email": "gorevli@sitepp.test",
  "name": "Ali Gorevli",
  "role": "STAFF",
  "apartmentNo": null,
  "phone": "5550000002",
  "createdAt": "2026-04-27T12:00:00.000Z",
  "activeAssignedTaskCount": 2
}
```
