import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TaskStatus, Priority } from '@prisma/client';

// Mock PrismaService
const mockPrismaService = {
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  project: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    // Reset tất cả mock trước mỗi test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================
  // Test: Tạo task mới
  // ==========================================
  describe('create', () => {
    const createDto = {
      title: 'Test Task',
      description: 'Test Description',
      priority: Priority.HIGH,
      projectId: 'project-uuid-1',
      assigneeId: 'user-uuid-1',
    };

    it('nên tạo task thành công khi dữ liệu hợp lệ', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue({ id: 'project-uuid-1' });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-uuid-1' });
      mockPrismaService.task.create.mockResolvedValue({
        id: 'task-uuid-1',
        ...createDto,
        status: TaskStatus.TODO,
      });

      const result = await service.create(createDto);
      expect(result).toBeDefined();
      expect(mockPrismaService.task.create).toHaveBeenCalled();
    });

    it('nên throw NotFoundException khi project không tồn tại', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('nên throw NotFoundException khi assignee không tồn tại', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue({ id: 'project-uuid-1' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // Test: Lấy danh sách tasks
  // ==========================================
  describe('findAll', () => {
    it('nên trả về danh sách tasks', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: TaskStatus.TODO },
        { id: '2', title: 'Task 2', status: TaskStatus.DONE },
      ];
      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll({});
      expect(result).toEqual(mockTasks);
    });

    it('nên filter theo status', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([]);

      await service.findAll({ status: TaskStatus.TODO });
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: TaskStatus.TODO }),
        }),
      );
    });
  });

  // ==========================================
  // Test: Lấy chi tiết task
  // ==========================================
  describe('findOne', () => {
    it('nên trả về task khi tìm thấy', async () => {
      const mockTask = { id: 'task-1', title: 'Test' };
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne('task-1');
      expect(result).toEqual(mockTask);
    });

    it('nên throw NotFoundException khi không tìm thấy', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('not-exist')).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // Test: Xóa task
  // ==========================================
  describe('remove', () => {
    it('nên xóa task thành công', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({ id: 'task-1' });
      mockPrismaService.task.delete.mockResolvedValue({ id: 'task-1' });

      const result = await service.remove('task-1');
      expect(result).toBeDefined();
      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
    });
  });
});
