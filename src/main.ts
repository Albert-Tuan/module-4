import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Bật CORS cho frontend
  app.enableCors();

  // Global Validation Pipe - tự động validate DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // Loại bỏ properties không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu gửi field lạ
      transform: true,         // Tự động transform type
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API quản lý tasks với PostgreSQL + Redis cache')
    .setVersion('1.0')
    .addTag('Auth', 'Xác thực người dùng')
    .addTag('Users', 'Quản lý người dùng')
    .addTag('Projects', 'Quản lý dự án')
    .addTag('Tasks', 'Quản lý công việc')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Khởi chạy server
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
