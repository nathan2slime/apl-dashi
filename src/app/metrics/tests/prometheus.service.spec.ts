import { beforeEach, describe, expect, it, vi } from 'vitest';

const { setDefaultLabels, metrics, collectDefaultMetrics, Registry } =
  vi.hoisted(() => {
    const setDefaultLabelsFn = vi.fn();
    const metricsFn = vi.fn();
    const collectDefaultMetricsFn = vi.fn();
    const RegistryFn = vi.fn(() => ({
      setDefaultLabels: setDefaultLabelsFn,
      metrics: metricsFn
    }));

    return {
      setDefaultLabels: setDefaultLabelsFn,
      metrics: metricsFn,
      collectDefaultMetrics: collectDefaultMetricsFn,
      Registry: RegistryFn
    };
  });

vi.mock('prom-client', () => ({
  Registry,
  collectDefaultMetrics
}));

import { PrometheusService } from '~/app/metrics/prometheus.service';

describe('PrometheusService', () => {
  beforeEach(() => {
    Registry.mockClear();
    setDefaultLabels.mockReset();
    collectDefaultMetrics.mockReset();
    metrics.mockReset();
  });

  it('should initialize registry with default labels and default metrics', () => {
    new PrometheusService();

    expect(Registry).toHaveBeenCalled();
    expect(setDefaultLabels).toHaveBeenCalledWith({ app: 'apl-dashi' });
    expect(collectDefaultMetrics).toHaveBeenCalledWith({
      register: expect.any(Object)
    });
  });

  it('should return serialized metrics', async () => {
    metrics.mockResolvedValue('my_metric 1');
    const service = new PrometheusService();

    const result = await service.getMetrics();

    expect(result).toBe('my_metric 1');
  });
});
