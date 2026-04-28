# Sitepp RBAC Matrisi (Faz 0)

Rol bazlı erişim kuralları. Her endpoint bu matrise göre kontrol edilmelidir.

## Roller
- `RESIDENT` = Sakin
- `STAFF` = Görevli
- `ADMIN` = Yönetici

## Yetki Matrisi

| Resource | Action | RESIDENT | STAFF | ADMIN | Kural Notu |
|---|---|---|---|---|---|
| Auth | register/login/refresh/logout | ✅ | ✅ | ✅ | Her kullanıcı kendi hesabı için |
| User | read self | ✅ | ✅ | ✅ | Sadece kendi profili |
| User | list all | ❌ | ❌ | ✅ | Kullanıcı yönetimi |
| User | update self profile | ✅ | ✅ | ✅ | Rol değiştirme hariç |
| User | update role | ❌ | ❌ | ✅ | Sadece yönetici |
| Category | read | ✅ | ✅ | ✅ | Herkes görebilir |
| Category | create/update/delete | ❌ | ❌ | ✅ | SLA ve kategori yönetimi |
| Task | create | ✅ | ❌ | ✅ | Sakin kendi talebini açar; admin da açabilir |
| Task | read own | ✅ | ❌ | ✅ | Resident için `task.residentId == user.id` |
| Task | read assigned | ❌ | ✅ | ✅ | Staff için `task.assignedStaffId == user.id` |
| Task | read all | ❌ | ❌ | ✅ | Tüm talepler |
| Task | assign staff | ❌ | ❌ | ✅ | Atama işlemi |
| Task | update content | ✅ | ❌ | ✅ | Resident sadece kendi task’ında, kısıtlı alanlar |
| Task | delete/cancel | ✅ | ❌ | ✅ | Resident sadece kendi task’ında, durum kuralına bağlı |
| TaskStatus | transition | ⚠️ | ✅ | ✅ | Geçiş state-machine + rol kurallarına bağlı |
| Comment | create on allowed task | ✅ | ✅ | ✅ | Erişim hakkı olan task’a yorum |
| Comment | read on allowed task | ✅ | ✅ | ✅ | Task görünürlüğü ile aynı |
| Attachment | upload on allowed task/comment | ✅ | ✅ | ✅ | Erişim hakkı olan kaynağa |
| Reports | read | ❌ | ❌ | ✅ | Yönetici ekranı |

## Sahiplik (Ownership) Kuralı
`RESIDENT` için en kritik kural:
- Bir kaydı görme/güncelleme yetkisi sadece kayıt kendisine aitse vardır.
- Teknik olarak: `resource.ownerId == req.user.id` kontrolü zorunludur.

## Durum Geçişi (Özet)
- `RESIDENT`: Açma, iptal etme (kendi kaydı), çözüm sonrası tekrar açma
- `STAFF`: `ASSIGNED -> IN_PROGRESS -> RESOLVED` hattında ilerleme
- `ADMIN`: Tüm geçişleri kural seti dahilinde yönetir

Kesin geçiş tablosu `tasks.state-machine.ts` içinde merkezi tutulmalıdır.