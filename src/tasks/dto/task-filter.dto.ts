import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, Priority } from '@prisma/client';

// DTO để filter/lọc danh sách tasks
export class TaskFilterDto {
  @ApiPropertyOptional({ enum: TaskStatus, description: 'Lọc theo trạng thái' })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: Priority, description: 'Lọc theo mức độ ưu tiên' })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({ description: 'Lọc theo project' })
  @IsUUID('4')
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo người được giao' })
  @IsUUID('4')
  @IsOptional()
  assigneeId?: string;
}
