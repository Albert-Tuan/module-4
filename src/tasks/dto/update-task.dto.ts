import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const TaskStatusValues = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
const PriorityValues = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Tiêu đề task' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết task' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatusValues })
  @IsEnum(TaskStatusValues, { message: 'Status phải là TODO, IN_PROGRESS, REVIEW hoặc DONE' })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: PriorityValues })
  @IsEnum(PriorityValues, { message: 'Priority phải là LOW, MEDIUM, HIGH hoặc URGENT' })
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ description: 'Hạn hoàn thành' })
  @IsDateString({}, { message: 'Deadline phải là định dạng ngày hợp lệ' })
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ description: 'ID người được giao task' })
  @IsUUID('4', { message: 'assigneeId phải là UUID hợp lệ' })
  @IsOptional()
  assigneeId?: string;
}
