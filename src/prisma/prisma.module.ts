import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() để PrismaService có thể inject ở bất kỳ module nào
// mà không cần import PrismaModule
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
