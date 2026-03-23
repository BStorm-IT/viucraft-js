import { FetchClient } from '../client/FetchClient';
import { BatchResource } from '../resources/BatchResource';
import {
  installFetchMock,
  mockFetchResponse,
  mockFetchNoContent,
  getLastFetchCall,
} from './helpers/mockFetch';
import { ResolvedClientConfig, BatchTask } from '../types';

const baseConfig: ResolvedClientConfig = {
  apiKey: 'test-api-key',
  baseUrl: 'https://api.viucraft.com',
  timeout: 5000,
  retry: false,
};

function makeResource(): BatchResource {
  const client = new FetchClient(baseConfig);
  return new BatchResource(client);
}

const mockJob = {
  id: 'job-123',
  status: 'pending' as const,
  tasks_total: 2,
  tasks_completed: 0,
  tasks_failed: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const sampleTasks: BatchTask[] = [
  { image_id: 'img-1', operations: 'resize_w_800' },
  { image_id: 'img-2', operations: 'grayscale', format: 'webp' },
];

beforeEach(() => {
  installFetchMock();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('BatchResource.create()', () => {
  it('sends POST to /api/v1/jobs with tasks array', async () => {
    mockFetchResponse(mockJob);
    const resource = makeResource();
    const promise = resource.create(sampleTasks);
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/jobs');
    expect(call[1].method).toBe('POST');
    const body = JSON.parse(call[1].body as string);
    expect(body.tasks).toEqual(sampleTasks);
    expect(result).toEqual(mockJob);
  });

  it('sends Idempotency-Key header when idempotencyKey is provided', async () => {
    mockFetchResponse(mockJob);
    const resource = makeResource();
    const promise = resource.create(sampleTasks, { idempotencyKey: 'unique-key-abc' });
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    const headers = call[1].headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBe('unique-key-abc');
  });

  it('does NOT send Idempotency-Key header when not provided', async () => {
    mockFetchResponse(mockJob);
    const resource = makeResource();
    const promise = resource.create(sampleTasks);
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    const headers = call[1].headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBeUndefined();
  });

  it('includes optional fields in body when provided', async () => {
    mockFetchResponse(mockJob);
    const resource = makeResource();
    const promise = resource.create(sampleTasks, {
      name: 'My batch job',
      webhook_url: 'https://example.com/hook',
      notify_on: 'completed',
      priority: 2,
    });
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    const body = JSON.parse(call[1].body as string);
    expect(body.name).toBe('My batch job');
    expect(body.webhook_url).toBe('https://example.com/hook');
    expect(body.notify_on).toBe('completed');
    expect(body.priority).toBe(2);
  });
});

describe('BatchResource.list()', () => {
  it('sends GET to /api/v1/jobs', async () => {
    mockFetchResponse({ jobs: [mockJob], pagination: { limit: 20, page: 1, total: 1 } });
    const resource = makeResource();
    const promise = resource.list();
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/jobs');
    expect(call[1].method).toBe('GET');
  });

  it('sends pagination params when provided', async () => {
    mockFetchResponse({ jobs: [], pagination: { limit: 5, page: 3, total: 0 } });
    const resource = makeResource();
    const promise = resource.list({ page: 3, per_page: 5 });
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toContain('page=3');
    expect(call[0]).toContain('per_page=5');
  });
});

describe('BatchResource.get()', () => {
  it('sends GET to /api/v1/jobs/{jobId}', async () => {
    mockFetchResponse({ ...mockJob, tasks: [] });
    const resource = makeResource();
    const promise = resource.get('job-123');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/jobs/job-123');
    expect(call[1].method).toBe('GET');
  });
});

describe('BatchResource.results()', () => {
  it('sends GET to /api/v1/jobs/{jobId}/results.json', async () => {
    mockFetchResponse([{ image_id: 'img-1', status: 'completed', output_url: 'https://cdn.example.com/out.jpg' }]);
    const resource = makeResource();
    const promise = resource.results('job-123');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/jobs/job-123/results.json');
    expect(call[1].method).toBe('GET');
  });
});

describe('BatchResource.cancel()', () => {
  it('sends POST to /api/v1/jobs/{jobId}/cancel', async () => {
    mockFetchResponse({ ...mockJob, status: 'cancelled' as const });
    const resource = makeResource();
    const promise = resource.cancel('job-123');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/jobs/job-123/cancel');
    expect(call[1].method).toBe('POST');
  });
});

describe('BatchResource.retry()', () => {
  it('sends POST to /api/v1/jobs/{jobId}/retry', async () => {
    mockFetchResponse({ ...mockJob, status: 'pending' as const });
    const resource = makeResource();
    const promise = resource.retry('job-123');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/jobs/job-123/retry');
    expect(call[1].method).toBe('POST');
  });
});

describe('BatchResource.download()', () => {
  it('sends GET to /api/v1/jobs/{jobId}/download', async () => {
    mockFetchResponse(new Blob(['zip data']));
    const resource = makeResource();
    const promise = resource.download('job-123');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/jobs/job-123/download');
    expect(call[1].method).toBe('GET');
  });
});
