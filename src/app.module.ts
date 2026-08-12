import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppCacheModule } from './cache/cache.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';

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
    AuthModule,
    ProjectsModule,
    TasksModule,
  ],
})
export class AppModule {}
