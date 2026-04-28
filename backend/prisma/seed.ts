import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

const passwordHash = await bcrypt.hash('Sitepp123', 10);

const defaultCategories = [
  { name: 'Tesisat', slaHours: 24, color: '#2563eb', icon: 'wrench' },
  { name: 'Elektrik', slaHours: 12, color: '#f59e0b', icon: 'bolt' },
  { name: 'Temizlik', slaHours: 48, color: '#10b981', icon: 'sparkles' },
  { name: 'Bahce', slaHours: 72, color: '#16a34a', icon: 'trees' },
  { name: 'Ortak Alan', slaHours: 36, color: '#7c3aed', icon: 'building-2' },
];

const legacySeedTaskIds = ['seed-task-open', 'seed-task-progress', 'seed-task-resolved'];

async function main(): Promise<void> {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sitepp.test' },
    update: {
      name: 'Sitepp Admin',
      role: 'ADMIN',
      passwordHash,
    },
    create: {
      email: 'admin@sitepp.test',
      passwordHash,
      name: 'Sitepp Admin',
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'gorevli@sitepp.test' },
    update: {
      name: 'Ali Gorevli',
      role: 'STAFF',
      phone: '5550000002',
      passwordHash,
    },
    create: {
      email: 'gorevli@sitepp.test',
      passwordHash,
      name: 'Ali Gorevli',
      role: 'STAFF',
      phone: '5550000002',
    },
  });

  const resident = await prisma.user.upsert({
    where: { email: 'sakin@sitepp.test' },
    update: {
      name: 'Ayse Sakin',
      role: 'RESIDENT',
      apartmentNo: 'A-12',
      phone: '5550000001',
      passwordHash,
    },
    create: {
      email: 'sakin@sitepp.test',
      passwordHash,
      name: 'Ayse Sakin',
      role: 'RESIDENT',
      apartmentNo: 'A-12',
      phone: '5550000001',
    },
  });

  const categories = new Map<string, { id: string }>();

  for (const category of defaultCategories) {
    const savedCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {
        slaHours: category.slaHours,
        color: category.color,
        icon: category.icon,
      },
      create: category,
    });

    categories.set(category.name, savedCategory);
  }

  const electricity = categories.get('Elektrik');
  const plumbing = categories.get('Tesisat');
  const cleaning = categories.get('Temizlik');

  if (!electricity || !plumbing || !cleaning) {
    throw new Error('Seed categories could not be created.');
  }

  await prisma.task.deleteMany({
    where: {
      id: {
        in: legacySeedTaskIds,
      },
    },
  });

  const seedTasks = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      description: 'A blok ikinci kattaki merdiven lambasi yanmiyor.',
      priority: 'MEDIUM' as const,
      status: 'OPEN' as const,
      categoryId: electricity.id,
      assignedStaffId: null,
      history: ['OPEN'] as const,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      description: 'Otopark girisindeki su sizintisi kontrol edilmeli.',
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      categoryId: plumbing.id,
      assignedStaffId: staff.id,
      history: ['OPEN', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS'] as const,
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      description: 'Ortak alan cam temizligi tamamlandi, sakin onayi bekliyor.',
      priority: 'LOW' as const,
      status: 'RESOLVED' as const,
      categoryId: cleaning.id,
      assignedStaffId: staff.id,
      resolvedAt: new Date(),
      history: ['OPEN', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as const,
    },
  ];

  for (const task of seedTasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        description: task.description,
        priority: task.priority,
        status: task.status,
        apartmentNo: resident.apartmentNo ?? 'A-12',
        categoryId: task.categoryId,
        assignedStaffId: task.assignedStaffId,
        resolvedAt: 'resolvedAt' in task ? task.resolvedAt : null,
      },
      create: {
        id: task.id,
        description: task.description,
        priority: task.priority,
        status: task.status,
        apartmentNo: resident.apartmentNo ?? 'A-12',
        residentId: resident.id,
        categoryId: task.categoryId,
        assignedStaffId: task.assignedStaffId,
        resolvedAt: 'resolvedAt' in task ? task.resolvedAt : null,
      },
    });

    await prisma.taskStatusHistory.deleteMany({
      where: { taskId: task.id },
    });

    await prisma.taskStatusHistory.createMany({
      data: task.history.map((toStatus, index) => ({
        taskId: task.id,
        fromStatus: index === 0 ? null : task.history[index - 1],
        toStatus,
        changedById: index <= 1 ? admin.id : staff.id,
        note: index === 0 ? 'Seed talep olusturuldu.' : 'Seed durum guncellendi.',
      })),
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
