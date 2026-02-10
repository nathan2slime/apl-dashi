import { Module } from '@nestjs/common';

import { PrometheusController } from '~/app/metrics/prometheus.controller';
import { PrometheusService } from '~/app/metrics/prometheus.service';

@Module({
  providers: [PrometheusService],
  controllers: [PrometheusController]
})
export class PrometheusModule {}
