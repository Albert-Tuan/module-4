# Task Management API - Kế Hoạch Chia Việc

## Tổng Quan

API quản lý Task với PostgreSQL + Redis cache.

---

## 1. Người 1: AUTH Module

### Nhiệm vụ
Xây dựng module xác thực: register, login, JWT token.

### File cần tạo
```
src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   └── jwt.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   └── roles.decorator.ts
├── dto/
│   ├── login.dto.ts
│   └── register.dto.ts
└── auth.service.spec.ts
```

### Công việc chi tiết
- [ ] Tạo register endpoint (email, password, name)
- [ ] Tạo login endpoint → trả JWT token
- [ ] Implement JWT Strategy cho passport
- [ ] Tạo JwtAuthGuard cho protected routes
- [ ] Tạo RolesGuard + @Roles decorator (optional)
- [ ] Viết unit test cho auth.service

### API Endpoints
```
POST /auth/register
POST /auth/login
GET  /auth/profile (protected)
```

---

## 2. Người 2: USERS Module

### Nhiệm vụ
Quản lý users: CRUD, profile, avatar.

### File cần tạo
```
src/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── entities/
│   └── user.entity.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user-response.dto.ts
└── users.service.spec.ts
```

### Công việc chi tiết
- [ ] Tạo User entity/schema (name, email, password, role, avatar)
- [ ] CRUD endpoints: GET/POST/PUT/DELETE /users
- [ ] GET /users/:id - lấy thông tin user
- [ ] PUT /users/:id - update profile
- [ ] DELETE /users/:id - xóa user (soft delete)
- [ ] Tích hợp Prisma
- [ ] Viết unit test

### API Endpoints
```
GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
DELETE /users/:id
```

---

## 3. Người 3: PROJECTS Module

### Nhiệm vụ
Quản lý projects: CRUD, thêm/xóa user vào project.

### File cần tạo
```
src/projects/
├── projects.module.ts
├── projects.controller.ts
├── projects.service.ts
├── entities/
│   └── project.entity.ts
├── dto/
│   ├── create-project.dto.ts
│   ├── update-project.dto.ts
│   └── add-member.dto.ts
└── projects.service.spec.ts
```

### Công việc chi tiết
- [ ] Tạo Project entity (name, description, ownerId)
- [ ] CRUD endpoints: GET/POST/PUT/DELETE /projects
- [ ] POST /projects/:id/members - thêm user vào project
- [ ] DELETE /projects/:id/members/:userId - xóa user khỏi project
- [ ] GET /projects/:id/members - lấy danh sách members
- [ ] Kiểm tra quyền: chỉ owner mới được sửa/xóa
- [ ] Viết unit test

### API Endpoints
```
GET    /projects
GET    /projects/:id
POST   /projects
PUT    /projects/:id
DELETE /projects/:id
POST   /projects/:id/members
DELETE /projects/:id/members/:userId
GET    /projects/:id/members
```

---

## 4. Người 4: TASKS Module + Infrastructure

### Nhiệm vụ
Quản lý tasks + Redis cache + Prisma schema.

#### 4a. Prisma Schema
```
prisma/
├── schema.prisma
└── migrations/
```

**Entities cần tạo:**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(MEMBER)
  projects  ProjectMember[]
  tasks     Task[]   @relation("assignedTo")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  ownerId     String
  members     ProjectMember[]
  tasks       Task[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProjectMember {
  userId    String
  projectId String
  role      ProjectRole @default(MEMBER)
  user      User    @relation(fields: [userId], references: [id])
  project   Project @relation(fields: [projectId], references: [id])
  @@id([userId, projectId])
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  deadline    DateTime?
  projectId   String
  assigneeId  String?
  project     Project   @relation(fields: [projectId], references: [id])
  assignee    User?     @relation("assignedTo", fields: [assigneeId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

enum Role {
  ADMIN
  MEMBER
}

enum ProjectRole {
  OWNER
  MEMBER
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

#### 4b. Tasks Module
```
src/tasks/
├── tasks.module.ts
├── tasks.controller.ts
├── tasks.service.ts
├── entities/
│   └── task.entity.ts
├── dto/
│   ├── create-task.dto.ts
│   ├── update-task.dto.ts
│   └── task-filter.dto.ts
└── tasks.service.spec.ts
```

#### 4c. Redis Cache Service
```
src/cache/
├── cache.module.ts
└── cache.service.ts
```

### Công việc chi tiết

**Prisma:**
- [ ] Viết schema.prisma đầy đủ
- [ ] Chạy `npx prisma migrate dev` tạo migration
- [ ] Tạo seed data mẫu

**Tasks:**
- [ ] CRUD tasks: GET/POST/PUT/DELETE /tasks
- [ ] GET /tasks?status=TODO&projectId=xxx - filter tasks
- [ ] PUT /tasks/:id/status - đổi status
- [ ] PUT /tasks/:id/assign - gán task cho user
- [ ] Kiểm tra quyền: member trong project mới được thao tác

**Redis:**
- [ ] Tạo CacheService với @nestjs/cache-manager
- [ ] Cache GET /tasks - 5 phút
- [ ] Invalidate cache khi có thay đổi
- [ ] (Optional) Queue notification khi deadline gần đến

### API Endpoints
```
GET    /tasks
GET    /tasks/:id
POST   /tasks
PUT    /tasks/:id
PATCH  /tasks/:id/status
PATCH  /tasks/:id/assign
DELETE /tasks/:id
```

---

## Quy Tắc Chung

### Git Workflow
```bash
# Mỗi người tạo nhánh riêng
git checkout -b feature/auth
git checkout -b feature/users
git checkout -b feature/projects
git checkout -b feature/tasks

# Commit khi hoàn thành từng task
git add .
git commit -m "feat(auth): add login endpoint"

# Push lên origin
git push origin feature/auth

# Tạo Pull Request vào main (sau khi thống nhất)
```

### Nguyên Tắc
1. **Không sửa schema.prisma** nếu chưa báo team
2. **Merge thứ tự:** auth → users → projects → tasks
3. **Test trước khi push**
4. **Comment code rõ ràng**

### Thứ Tự Merge Đề Xuất
1. **Người 4** push `prisma/schema.prisma` trước (base)
2. **Người 1** merge auth sau khi có schema
3. **Người 2** merge users sau khi có schema
4. **Người 3** merge projects sau khi có users
5. **Người 4** merge tasks + cache cuối cùng

---

## Thời Gian Ước Tính

| Module | Thời gian | Độ khó |
|--------|-----------|--------|
| Auth | 2-3 giờ | Trung bình |
| Users | 2 giờ | Dễ |
| Projects | 3 giờ | Trung bình |
| Tasks + Cache | 4-5 giờ | Khó |

---

## Liên Hệ Khi Cần Hỗ Trợ

- **Auth:** Hỏi về JWT, Passport
- **Prisma:** Hỏi Người 4
- **Git conflicts:** Họp team thống nhất
