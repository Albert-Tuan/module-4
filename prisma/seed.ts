import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');

  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Đã xóa dữ liệu cũ.');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz1Md7Lgx2R1dFg7f8PSu',
      role: 'ADMIN',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'member1@example.com',
      name: 'Nguyễn Văn A',
      password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz1Md7Lgx2R1dFg7f8PSu',
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'member2@example.com',
      name: 'Trần Thị B',
      password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz1Md7Lgx2R1dFg7f8PSu',
      role: 'MEMBER',
    },
  });

  console.log('👤 Đã tạo 3 users.');

  const project1 = await prisma.project.create({
    data: {
      name: 'Website Bán Hàng',
      description: 'Xây dựng website bán hàng online với NestJS + React',
      ownerId: admin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'App Mobile',
      description: 'Ứng dụng quản lý công việc trên điện thoại',
      ownerId: member1.id,
    },
  });

  console.log('📁 Đã tạo 2 projects.');

  await prisma.projectMember.createMany({
    data: [
      { userId: admin.id, projectId: project1.id, role: 'OWNER' },
      { userId: member1.id, projectId: project1.id, role: 'MEMBER' },
      { userId: member2.id, projectId: project1.id, role: 'MEMBER' },
      { userId: member1.id, projectId: project2.id, role: 'OWNER' },
      { userId: member2.id, projectId: project2.id, role: 'MEMBER' },
    ],
  });

  console.log('👥 Đã thêm members vào projects.');

  await prisma.task.createMany({
    data: [
      {
        title: 'Thiết kế database schema',
        description: 'Thiết kế ERD và tạo Prisma schema cho dự án',
        status: 'DONE',
        priority: 'HIGH',
        deadline: new Date('2025-12-31'),
        projectId: project1.id,
        assigneeId: admin.id,
      },
      {
        title: 'Xây dựng API Authentication',
        description: 'Implement register, login, JWT token',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        deadline: new Date('2026-01-15'),
        projectId: project1.id,
        assigneeId: member1.id,
      },
      {
        title: 'Tạo giao diện trang chủ',
        description: 'Design và code trang chủ responsive',
        status: 'TODO',
        priority: 'MEDIUM',
        deadline: new Date('2026-02-01'),
        projectId: project1.id,
        assigneeId: member2.id,
      },
      {
        title: 'Setup CI/CD Pipeline',
        description: 'Cấu hình GitHub Actions cho auto deploy',
        status: 'TODO',
        priority: 'LOW',
        projectId: project1.id,
        assigneeId: null,
      },
      {
        title: 'Thiết kế UI/UX Mobile App',
        description: 'Wireframe và mockup cho ứng dụng mobile',
        status: 'REVIEW',
        priority: 'URGENT',
        deadline: new Date('2026-01-10'),
        projectId: project2.id,
        assigneeId: member2.id,
      },
    ],
  });

  console.log('✅ Đã tạo 5 tasks.');
  console.log('🎉 Seed hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
