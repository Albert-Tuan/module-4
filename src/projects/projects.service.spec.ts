import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectsService, ProjectsPrisma } from './projects.service';

describe('ProjectsService', () => {
  type MockedPrisma = {
    project: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    user: { findUnique: jest.Mock };
    projectMember: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const prisma: MockedPrisma = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: { findUnique: jest.fn() },
    projectMember: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const currentUser = { userId: 'owner-id', email: 'owner@example.com' };
  let service: ProjectsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProjectsService(prisma as unknown as ProjectsPrisma);
  });

  it('creates a project and its owner membership in one transaction', async () => {
    const project = { id: 'project-id', ownerId: currentUser.userId };
    const transaction = { ...prisma };
    transaction.project.create.mockResolvedValue(project);
    transaction.projectMember.create.mockResolvedValue({ projectId: project.id, userId: currentUser.userId });
    prisma.$transaction.mockImplementation(async (callback: (tx: ProjectsPrisma) => Promise<unknown>) =>
      callback(transaction as unknown as ProjectsPrisma),
    );

    await expect(service.create({ name: 'Project', description: 'Description' }, currentUser)).resolves.toEqual(project);
    expect(transaction.projectMember.create).toHaveBeenCalledWith({
      data: { projectId: project.id, userId: currentUser.userId, role: 'OWNER' },
    });
  });

  it('lists only projects visible to the current user', async () => {
    prisma.project.findMany.mockResolvedValue([]);

    await service.findAll(currentUser);

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { ownerId: currentUser.userId },
          { members: { some: { userId: currentUser.userId } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('rejects updates from a non-owner', async () => {
    prisma.project.findFirst.mockResolvedValue({ id: 'project-id', ownerId: 'another-user' });

    await expect(service.update('project-id', { name: 'New name' }, currentUser)).rejects.toThrow(ForbiddenException);
    expect(prisma.project.update).not.toHaveBeenCalled();
  });

  it('rejects an unknown project', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    await expect(service.findOne('missing-id', currentUser)).rejects.toThrow(NotFoundException);
  });

  it('rejects duplicate members', async () => {
    prisma.project.findFirst.mockResolvedValue({ id: 'project-id', ownerId: currentUser.userId });
    prisma.user.findUnique.mockResolvedValue({ id: 'member-id' });
    prisma.projectMember.findUnique.mockResolvedValue({ projectId: 'project-id', userId: 'member-id' });

    await expect(service.addMember('project-id', 'member-id', currentUser)).rejects.toThrow(ConflictException);
  });

  it('does not allow removing the project owner', async () => {
    prisma.project.findFirst.mockResolvedValue({ id: 'project-id', ownerId: currentUser.userId });
    prisma.projectMember.findUnique.mockResolvedValue({ role: 'OWNER' });

    await expect(service.removeMember('project-id', currentUser.userId, currentUser)).rejects.toThrow(ForbiddenException);
    expect(prisma.projectMember.delete).not.toHaveBeenCalled();
  });
});
