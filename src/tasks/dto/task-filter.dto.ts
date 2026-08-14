import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const TaskStatusValues = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
const PriorityValues = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export class TaskFilterDto {
  @ApiPropertyOptional({ enum: TaskStatusValues, description: 'Lọc theo trạng thái' })
  @IsEnum(TaskStatusValues)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: PriorityValues, description: 'Lọc theo mức độ ưu tiên' })
  @IsEnum(PriorityValues)
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ description: 'Lọc theo project' })
  @IsUUID('4')
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo người được giao' })
  @IsUUID('4')
  @IsOptional()
  assigneeId?: string;
}
