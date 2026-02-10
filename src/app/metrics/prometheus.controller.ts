import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

import { PrometheusService } from '~/app/metrics/prometheus.service';

@Controller('metrics')
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    const metrics = await this.prometheusService.getMetrics();

    res.setHeader('Content-Type', 'text/plain');
    res.send(metrics);
  }
}
