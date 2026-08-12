import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

// Module quản lý Redis cache
// @Global() để CacheService có thể dùng ở bất kỳ đâu
@Global()
@Module({
  imports: [
    NestCacheModule.register({
      // Sử dụng in-memory cache mặc định
      // Khi deploy production, team có thể đổi sang redis store:
      // store: redisStore,
      // host: process.env.REDIS_HOST,
      // port: parseInt(process.env.REDIS_PORT),
      ttl: 300000,   // TTL mặc định: 5 phút (milliseconds)
      max: 100,      // Tối đa 100 items trong cache
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class AppCacheModule {}
