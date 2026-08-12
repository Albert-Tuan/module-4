import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Tạo task mới
  async create(createTaskDto: CreateTaskDto) {
    this.logger.log(`Tạo task mới: ${createTaskDto.title}`);

    // Kiểm tra project tồn tại
    const project = await this.prisma.project.findUnique({
      where: { id: createTaskDto.projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project với ID ${createTaskDto.projectId} không tồn tại`);
    }

    // Kiểm tra assignee tồn tại (nếu có)
    if (createTaskDto.assigneeId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createTaskDto.assigneeId },
      });
      if (!user) {
        throw new NotFoundException(`User với ID ${createTaskDto.assigneeId} không tồn tại`);
      }
    }

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        priority: createTaskDto.priority,
        deadline: createTaskDto.deadline ? new Date(createTaskDto.deadline) : null,
        projectId: createTaskDto.projectId,
        assigneeId: createTaskDto.assigneeId,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // Lấy danh sách tasks với bộ lọc
  async findAll(filter: TaskFilterDto) {
    this.logger.log('Lấy danh sách tasks');

    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.assigneeId) where.assigneeId = filter.assigneeId;

    return this.prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  // Lấy chi tiết 1 task theo ID
  async findOne(id: string) {
    this.logger.log(`Lấy task: ${id}`);

    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, description: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task với ID ${id} không tồn tại`);
    }

    return task;
  }

  // Cập nhật task
  async update(id: string, updateTaskDto: UpdateTaskDto) {
    this.logger.log(`Cập nhật task: ${id}`);

    // Kiểm tra task tồn tại
    await this.findOne(id);

    // Kiểm tra assignee mới tồn tại (nếu có)
    if (updateTaskDto.assigneeId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateTaskDto.assigneeId },
      });
      if (!user) {
        throw new NotFoundException(`User với ID ${updateTaskDto.assigneeId} không tồn tại`);
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        deadline: updateTaskDto.deadline ? new Date(updateTaskDto.deadline) : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // Cập nhật trạng thái task
  async updateStatus(id: string, status: TaskStatus) {
    this.logger.log(`Đổi status task ${id} → ${status}`);

    // Kiểm tra task tồn tại
    await this.findOne(id);

    return this.prisma.task.update({
      where: { id },
      data: { status },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // Gán task cho user
  async assignTask(id: string, assigneeId: string) {
    this.logger.log(`Gán task ${id} cho user ${assigneeId}`);

    // Kiểm tra task tồn tại
    await this.findOne(id);

    // Kiểm tra user tồn tại
    const user = await this.prisma.user.findUnique({
      where: { id: assigneeId },
    });
    if (!user) {
      throw new NotFoundException(`User với ID ${assigneeId} không tồn tại`);
    }

    return this.prisma.task.update({
      where: { id },
      data: { assigneeId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // Xóa task
  async remove(id: string) {
    this.logger.log(`Xóa task: ${id}`);

    // Kiểm tra task tồn tại
    await this.findOne(id);

    return this.prisma.task.delete({
      where: { id },
    });
  }
}
