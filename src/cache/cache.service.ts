import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Lấy giá trị từ cache theo key
   * @param key - Cache key
   * @returns Giá trị đã cache hoặc undefined
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache HIT: ${key}`);
      } else {
        this.logger.debug(`Cache MISS: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Lỗi khi đọc cache key "${key}":`, error);
      return undefined;
    }
  }

  /**
   * Lưu giá trị vào cache
   * @param key - Cache key
   * @param value - Giá trị cần cache
   * @param ttl - Thời gian sống (milliseconds), mặc định 5 phút
   */
  async set(key: string, value: any, ttl: number = 300000): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}ms)`);
    } catch (error) {
      this.logger.error(`Lỗi khi ghi cache key "${key}":`, error);
    }
  }

  /**
   * Xóa 1 key khỏi cache
   * @param key - Cache key cần xóa
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Lỗi khi xóa cache key "${key}":`, error);
    }
  }

  /**
   * Xóa tất cả cache (dùng khi cần invalidate toàn bộ)
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.log('Cache đã được reset toàn bộ');
    } catch (error) {
      this.logger.error('Lỗi khi reset cache:', error);
    }
  }

  /**
   * Lấy từ cache, nếu không có thì gọi factory function và cache kết quả
   * Pattern: Cache-Aside
   * @param key - Cache key
   * @param factory - Hàm tạo dữ liệu nếu cache miss
   * @param ttl - Thời gian sống (milliseconds)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = 300000,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
}
