import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  // Kết nối database khi module khởi tạo
  async onModuleInit() {
    this.logger.log('Đang kết nối đến PostgreSQL...');
    await this.$connect();
    this.logger.log('Kết nối PostgreSQL thành công!');
  }

  // Ngắt kết nối khi module bị hủy
  async onModuleDestroy() {
    this.logger.log('Đang ngắt kết nối PostgreSQL...');
    await this.$disconnect();
    this.logger.log('Đã ngắt kết nối PostgreSQL.');
  }
}
