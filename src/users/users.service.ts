import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        // Assuming password hashing happens here or in an interceptor/Auth module
        // For now, storing as is since bcrypt isn't in dependencies.
      },
    });
    return new UserResponseDto(user as any);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: {
        // Assume deletedAt exists for soft delete
        // If the schema doesn't have it yet, this will error until Person 4 updates it
        deletedAt: null, 
      },
    });
    return users.map((u) => new UserResponseDto(u as any));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return new UserResponseDto(user as any);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Check existence first
    await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return new UserResponseDto(updatedUser as any);
  }

  async remove(id: string): Promise<{ message: string }> {
    // Check existence first
    await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      } as any,
    });

    return { message: `User ${id} has been soft deleted successfully` };
  }
}
