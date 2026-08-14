import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Role } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'uuid-1234',
    email: 'test@example.com',
    name: 'Test User',
    password: 'password',
    role: Role.MEMBER,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn().mockResolvedValue([mockUser]),
      findFirst: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].email).toEqual(mockUser.email);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const result = await service.findOne('uuid-1234');
      expect(result.id).toEqual(mockUser.id);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'uuid-1234', deletedAt: null },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce(null);
      await expect(service.findOne('not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const createDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
        role: Role.MEMBER,
      };
      const result = await service.create(createDto);
      expect(result.email).toEqual(createDto.email);
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return a user', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedMock = { ...mockUser, name: 'Updated Name' };
      mockPrismaService.user.update.mockResolvedValueOnce(updatedMock);

      const result = await service.update('uuid-1234', updateDto);
      expect(result.name).toEqual('Updated Name');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1234' },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a user (update deletedAt)', async () => {
      const result = await service.remove('uuid-1234');
      expect(result.message).toContain('successfully');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1234' },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      });
    });
  });
});
