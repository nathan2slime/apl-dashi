import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator
} from '@nestjs/terminus';
import { PrismaService } from '~/app/database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheck: HealthCheckService,
    private readonly diskHealth: DiskHealthIndicator,
    private readonly memoryHealth: MemoryHealthIndicator,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheck.check([
      () => this.memoryHealth.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024),
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () =>
        this.diskHealth.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.5
        })
    ]);
  }
}
