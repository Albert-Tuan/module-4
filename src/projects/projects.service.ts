import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity, ProjectMemberEntity } from './entities/project.entity';

/** The shape exposed by the auth module's JWT strategy. */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role?: string;
}

/** Minimal Prisma contract keeps this module easy to unit-test with mocks. */
export interface ProjectsPrisma {
  project: {
    create(args: unknown): Promise<ProjectEntity>;
    findMany(args: unknown): Promise<ProjectEntity[]>;
    findFirst(args: unknown): Promise<ProjectEntity | null>;
    update(args: unknown): Promise<ProjectEntity>;
    delete(args: unknown): Promise<ProjectEntity>;
  };
  user: {
    findUnique(args: unknown): Promise<{ id: string } | null>;
  };
  projectMember: {
    create(args: unknown): Promise<ProjectMemberEntity>;
    findUnique(args: unknown): Promise<ProjectMemberEntity | null>;
    findMany(args: unknown): Promise<ProjectMemberEntity[]>;
    delete(args: unknown): Promise<ProjectMemberEntity>;
  };
  $transaction<T>(callback: (tx: ProjectsPrisma) => Promise<T>): Promise<T>;
}

@Injectable()
export class ProjectsService {
  constructor(@Inject(PrismaService) private readonly prisma: ProjectsPrisma) {}

  create(dto: CreateProjectDto, currentUser: AuthenticatedUser): Promise<ProjectEntity> {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: dto.name,
          description: dto.description,
          ownerId: currentUser.userId,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: currentUser.userId,
          role: 'OWNER',
        },
      });

      return project;
    });
  }

  findAll(currentUser: AuthenticatedUser): Promise<ProjectEntity[]> {
    return this.prisma.project.findMany({
      where: {
        OR: [
          { ownerId: currentUser.userId },
          { members: { some: { userId: currentUser.userId } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<ProjectEntity> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: currentUser.userId },
          { members: { some: { userId: currentUser.userId } } },
        ],
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, currentUser: AuthenticatedUser): Promise<ProjectEntity> {
    await this.requireOwner(id, currentUser);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<void> {
    await this.requireOwner(id, currentUser);
    await this.prisma.project.delete({ where: { id } });
  }

  async addMember(id: string, userId: string, currentUser: AuthenticatedUser): Promise<ProjectMemberEntity> {
    await this.requireOwner(id, currentUser);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: id } },
    });
    if (existing) throw new ConflictException('User is already a project member');

    return this.prisma.projectMember.create({
      data: { projectId: id, userId, role: 'MEMBER' },
    });
  }

  async removeMember(id: string, userId: string, currentUser: AuthenticatedUser): Promise<void> {
    await this.requireOwner(id, currentUser);
    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: id } },
    });
    if (!member) throw new NotFoundException('Project member not found');
    if (member.role === 'OWNER') throw new ForbiddenException('Project owner cannot be removed');

    await this.prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId: id } },
    });
  }

  async getMembers(id: string, currentUser: AuthenticatedUser): Promise<ProjectMemberEntity[]> {
    await this.findOne(id, currentUser);
    return this.prisma.projectMember.findMany({
      where: { projectId: id },
      include: { user: true },
      orderBy: { role: 'asc' },
    });
  }

  private async requireOwner(id: string, currentUser: AuthenticatedUser): Promise<ProjectEntity> {
    const project = await this.prisma.project.findFirst({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== currentUser.userId) {
      throw new ForbiddenException('Only the project owner can perform this action');
    }
    return project;
  }
}
