# Task Management API — Module 4

API quản lý Tasks xây dựng bằng **NestJS** + **PostgreSQL** + **Redis** cache.

## Yêu cầu

- Node.js >= 18
- Docker & Docker Compose
- npm >= 9

## Cài đặt & Chạy

### 1. Clone & cài dependencies

```bash
git clone https://github.com/Albert-Tuan/module-4.git
cd module-4
npm install
```

### 2. Tạo file môi trường

```bash
cp .env.example .env
```

### 3. Khởi động Docker (PostgreSQL + Redis + Adminer)

```bash
npm run docker:up
# hoặc
docker compose -f docker/docker-compose.yml up -d
```

### 4. Tạo database & migration

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Seed dữ liệu mẫu

```bash
npx prisma db seed
```

### 6. Chạy ứng dụng

```bash
npm run start:dev
```

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Adminer (DB UI)**: http://localhost:8080

## Cấu trúc Project

```
module-4/
├── prisma/
│   ├── schema.prisma       # Database schema (User, Project, Task)
│   ├── seed.ts              # Seed dữ liệu mẫu
│   └── migrations/          # Database migrations
├── src/
│   ├── main.ts              # Entry point
│   ├── app.module.ts        # Root module
│   ├── prisma/              # Prisma service (database)
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── cache/               # Redis cache service
│   │   ├── cache.module.ts
│   │   └── cache.service.ts
│   ├── tasks/               # Tasks module (Người 4)
│   │   ├── tasks.module.ts
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   ├── tasks.service.spec.ts
│   │   ├── dto/
│   │   │   ├── create-task.dto.ts
│   │   │   ├── update-task.dto.ts
│   │   │   └── task-filter.dto.ts
│   │   └── entities/
│   │       └── task.entity.ts
│   ├── auth/                # Auth module (Người 1) — chưa tạo
│   ├── users/               # Users module (Người 2) — chưa tạo
│   └── projects/            # Projects module (Người 3) — chưa tạo
├── docker/
│   ├── docker-compose.yml   # PostgreSQL + Redis + Adminer
│   └── Dockerfile           # Multi-stage build
├── package.json
├── tsconfig.json
└── TASK_PLAN.md             # Kế hoạch chia việc
```

## API Endpoints — Tasks

| Method | Endpoint             | Mô tả                    |
|--------|----------------------|---------------------------|
| GET    | /tasks               | Lấy danh sách tasks      |
| GET    | /tasks/:id           | Lấy chi tiết task        |
| POST   | /tasks               | Tạo task mới             |
| PUT    | /tasks/:id           | Cập nhật task            |
| PATCH  | /tasks/:id/status    | Đổi trạng thái task      |
| PATCH  | /tasks/:id/assign    | Gán task cho user        |
| DELETE | /tasks/:id           | Xóa task                 |

### Filter tasks

```
GET /tasks?status=TODO&projectId=xxx&priority=HIGH&assigneeId=yyy
```

## Scripts hữu ích

```bash
npm run start:dev        # Chạy dev mode (hot reload)
npm run build            # Build production
npm run test             # Chạy unit tests
npm run prisma:studio    # Mở Prisma Studio (GUI xem DB)
npm run prisma:migrate   # Tạo migration mới
npm run prisma:seed      # Seed dữ liệu mẫu
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
```

## Phân công nhóm

| Người | Module | Nhánh |
|-------|--------|-------|
| 1 | Auth (register, login, JWT, guard) | `feature/auth` |
| 2 | Users (CRUD, profile) | `feature/users` |
| 3 | Projects (CRUD, assign members) | `feature/projects` |
| 4 | Tasks + Prisma + Docker + Redis | `feature/tasks` |

## Thứ tự merge

1. **Người 4** push `prisma/schema.prisma` trước (base)
2. **Người 1** merge auth
3. **Người 2** merge users
4. **Người 3** merge projects
5. **Người 4** merge tasks + cache cuối cùng