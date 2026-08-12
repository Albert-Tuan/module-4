import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo task mới' })
  @ApiResponse({ status: 201, description: 'Task đã được tạo thành công' })
  @ApiResponse({ status: 404, description: 'Project hoặc User không tồn tại' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tasks' })
  @ApiResponse({ status: 200, description: 'Danh sách tasks' })
  findAll(@Query() filter: TaskFilterDto) {
    return this.tasksService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết task theo ID' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Chi tiết task' })
  @ApiResponse({ status: 404, description: 'Task không tồn tại' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Task đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Task không tồn tại' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Status đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Task không tồn tại' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.tasksService.updateStatus(id, status);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Gán task cho user' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Task đã được gán' })
  @ApiResponse({ status: 404, description: 'Task hoặc User không tồn tại' })
  assignTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('assigneeId') assigneeId: string,
  ) {
    return this.tasksService.assignTask(id, assigneeId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Task đã được xóa' })
  @ApiResponse({ status: 404, description: 'Task không tồn tại' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
