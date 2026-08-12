import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const TaskStatusValues = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const PriorityValues = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export class TaskEntity {
  @ApiProperty({ description: 'ID duy nhất của task' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề task' })
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  description: string | null;

  @ApiProperty({ enum: TaskStatusValues, description: 'Trạng thái hiện tại' })
  status: string;

  @ApiProperty({ enum: PriorityValues, description: 'Mức độ ưu tiên' })
  priority: string;

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
