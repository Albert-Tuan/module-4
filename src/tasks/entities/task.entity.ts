import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, Priority } from '@prisma/client';

// Entity class mô tả cấu trúc response của Task
export class TaskEntity {
  @ApiProperty({ description: 'ID duy nhất của task' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề task' })
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  description: string | null;

  @ApiProperty({ enum: TaskStatus, description: 'Trạng thái hiện tại' })
  status: TaskStatus;

  @ApiProperty({ enum: Priority, description: 'Mức độ ưu tiên' })
  priority: Priority;

  @ApiPropertyOptional({ description: 'Hạn hoàn thành' })
  deadline: Date | null;

  @ApiProperty({ description: 'ID project chứa task' })
  projectId: string;

  @ApiPropertyOptional({ description: 'ID người được giao' })
  assigneeId: string | null;

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật cuối' })
  updatedAt: Date;

  constructor(partial: Partial<TaskEntity>) {
    Object.assign(this, partial);
  }
}
