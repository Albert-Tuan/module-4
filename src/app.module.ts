import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppCacheModule } from './cache/cache.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    // Load biến môi trường từ .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database - Prisma ORM
    PrismaModule,

    // Cache - Redis/In-memory
    AppCacheModule,

    // Feature Modules
    TasksModule,

    // Các module khác sẽ được thêm bởi team:
    // AuthModule    (Người 1)
    // UsersModule   (Người 2)
    // ProjectsModule (Người 3)
  ],
})
export class AppModule {}
