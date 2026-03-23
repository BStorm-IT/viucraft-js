import { FetchClient } from '../client/FetchClient';
import { UsageResource } from '../resources/UsageResource';
import {
  installFetchMock,
  mockFetchResponse,
  getLastFetchCall,
} from './helpers/mockFetch';
import { ResolvedClientConfig } from '../types';

const baseConfig: ResolvedClientConfig = {
  apiKey: 'test-api-key',
  baseUrl: 'https://api.viucraft.com',
  timeout: 5000,
  retry: false,
};

function makeResource(): UsageResource {
  const client = new FetchClient(baseConfig);
  return new UsageResource(client);
}

beforeEach(() => {
  installFetchMock();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('UsageResource.current()', () => {
  it('sends GET to /api/v1/usage with period=current', async () => {
    mockFetchResponse({
      requests: { used: 1500, limit: 10000, percentage: 15 },
      storage: { used: 500000000, limit: 5000000000, percentage: 10 },
      bandwidth: { used: 2000000000, limit: 50000000000, percentage: 4 },
    });
    const resource = makeResource();
    const promise = resource.current();
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/usage?period=current');
    expect(call[1].method).toBe('GET');
    expect(result.requests.used).toBe(1500);
  });

  it('sends period=current (not period=daily)', async () => {
    mockFetchResponse({
      requests: { used: 0, limit: 10000, percentage: 0 },
      storage: { used: 0, limit: 5000000000, percentage: 0 },
      bandwidth: { used: 0, limit: 50000000000, percentage: 0 },
    });
    const resource = makeResource();
    const promise = resource.current();
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toContain('period=current');
    expect(call[0]).not.toContain('period=daily');
  });
});

describe('UsageResource.daily()', () => {
  it('sends GET to /api/v1/usage with period=daily', async () => {
    mockFetchResponse([
      { date: '2026-01-01', requests: 500, bandwidth: 1000000, storage: 200000 },
      { date: '2026-01-02', requests: 650, bandwidth: 1200000, storage: 200000 },
    ]);
    const resource = makeResource();
    const promise = resource.daily();
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/usage?period=daily');
    expect(call[1].method).toBe('GET');
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].date).toBe('2026-01-01');
  });

  it('sends start_date and end_date params when provided', async () => {
    mockFetchResponse([]);
    const resource = makeResource();
    const promise = resource.daily({ start_date: '2026-01-01', end_date: '2026-01-31' });
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toContain('period=daily');
    expect(call[0]).toContain('start_date=2026-01-01');
    expect(call[0]).toContain('end_date=2026-01-31');
  });

  it('sends only period=daily when no date params provided', async () => {
    mockFetchResponse([]);
    const resource = makeResource();
    const promise = resource.daily();
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toContain('period=daily');
    expect(call[0]).not.toContain('start_date');
    expect(call[0]).not.toContain('end_date');
  });
});
