# Sitepp ER Diyagramı (Faz 0)

Bu doküman, MVP için veritabanı tablolarını ve ilişkilerini tanımlar.

## Varlıklar

### 1) User
- `id` (uuid, pk)
- `email` (string, unique)
- `passwordHash` (string)
- `name` (string)
- `role` (`RESIDENT | STAFF | ADMIN`)
- `apartmentNo` (string, nullable)
- `phone` (string, nullable)
- `createdAt` (datetime)
- `updatedAt` (datetime)

### 2) Category
- `id` (uuid, pk)
- `name` (string, unique)
- `slaHours` (int)
- `color` (string)
- `icon` (string)
- `createdAt` (datetime)
- `updatedAt` (datetime)

### 3) Task
- `id` (uuid, pk)
- `residentId` (fk -> User.id)
- `assignedStaffId` (fk -> User.id, nullable)
- `categoryId` (fk -> Category.id)
- `title` (string)
- `description` (text)
- `priority` (`LOW | MEDIUM | HIGH | URGENT`)
- `status` (`OPEN | IN_REVIEW | ASSIGNED | IN_PROGRESS | RESOLVED | CLOSED | CANCELLED | REOPENED`)
- `apartmentNo` (string)
- `createdAt` (datetime)
- `updatedAt` (datetime)
- `resolvedAt` (datetime, nullable)
- `closedAt` (datetime, nullable)

### 4) TaskStatusHistory
- `id` (uuid, pk)
- `taskId` (fk -> Task.id)
- `fromStatus` (TaskStatus, nullable)
- `toStatus` (TaskStatus)
- `changedById` (fk -> User.id)
- `changedAt` (datetime)
- `note` (string, nullable)

### 5) Comment
- `id` (uuid, pk)
- `taskId` (fk -> Task.id)
- `authorId` (fk -> User.id)
- `body` (text)
- `createdAt` (datetime)
- `updatedAt` (datetime)

### 6) Attachment
- `id` (uuid, pk)
- `taskId` (fk -> Task.id, nullable)
- `commentId` (fk -> Comment.id, nullable)
- `uploadedById` (fk -> User.id)
- `originalName` (string)
- `fileName` (string)
- `mimeType` (string)
- `size` (int)
- `path` (string)
- `createdAt` (datetime)

## İlişkiler
- `User (resident)` 1 - N `Task`
- `User (staff)` 1 - N `Task` (atanan görevler)
- `Category` 1 - N `Task`
- `Task` 1 - N `TaskStatusHistory`
- `Task` 1 - N `Comment`
- `Comment` 1 - N `Attachment`
- `Task` 1 - N `Attachment`

## Önerilen İndeksler
- `User.email` (unique)
- `Task.residentId`
- `Task.assignedStaffId`
- `Task.categoryId`
- `Task.status`
- `Task.createdAt`
- `TaskStatusHistory.taskId + changedAt`
- `Comment.taskId + createdAt`

## Not
SLA için `deadline` alanı DB’de zorunlu değil. MVP’de listeleme sırasında `createdAt + category.slaHours` olarak hesaplanabilir.