import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ description: 'Tiêu đề task', example: 'Thiết kế database' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết task' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
  @IsEnum(Priority, { message: 'Priority phải là LOW, MEDIUM, HIGH hoặc URGENT' })
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({ description: 'Hạn hoàn thành', example: '2026-12-31T00:00:00.000Z' })
  @IsDateString({}, { message: 'Deadline phải là định dạng ngày hợp lệ' })
  @IsOptional()
  deadline?: string;

  @ApiProperty({ description: 'ID project chứa task' })
  @IsUUID('4', { message: 'projectId phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'projectId không được để trống' })
  projectId: string;

  @ApiPropertyOptional({ description: 'ID người được giao task' })
  @IsUUID('4', { message: 'assigneeId phải là UUID hợp lệ' })
  @IsOptional()
  assigneeId?: string;
}
