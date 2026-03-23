import { FetchClient } from '../client/FetchClient';
import { WarmSetsResource } from '../resources/WarmSetsResource';
import {
  installFetchMock,
  mockFetchResponse,
  mockFetchNoContent,
  getLastFetchCall,
} from './helpers/mockFetch';
import { ResolvedClientConfig } from '../types';

const baseConfig: ResolvedClientConfig = {
  apiKey: 'test-api-key',
  baseUrl: 'https://api.viucraft.com',
  timeout: 5000,
  retry: false,
};

function makeResource(): WarmSetsResource {
  const client = new FetchClient(baseConfig);
  return new WarmSetsResource(client);
}

const mockWarmSet = {
  id: 'ws-abc-123',
  name: 'hero-images',
  operations: 'resize_w_1200',
  format: 'webp',
  created_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  installFetchMock();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('WarmSetsResource.list()', () => {
  it('sends GET to /api/warm-sets', async () => {
    mockFetchResponse({ warm_sets: [mockWarmSet] });
    const resource = makeResource();
    const promise = resource.list();
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/warm-sets');
    expect(call[1].method).toBe('GET');
  });
});

describe('WarmSetsResource.create()', () => {
  it('sends POST to /api/warm-sets with name and operations', async () => {
    mockFetchResponse(mockWarmSet);
    const resource = makeResource();
    const promise = resource.create('hero-images', 'resize_w_1200');
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/warm-sets');
    expect(call[1].method).toBe('POST');
    const body = JSON.parse(call[1].body as string);
    expect(body.name).toBe('hero-images');
    expect(body.operations).toBe('resize_w_1200');
    expect(result).toEqual(mockWarmSet);
  });

  it('includes format when provided in options', async () => {
    mockFetchResponse({ ...mockWarmSet, format: 'webp' });
    const resource = makeResource();
    const promise = resource.create('hero-images', 'resize_w_1200', { format: 'webp' });
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    const body = JSON.parse(call[1].body as string);
    expect(body.format).toBe('webp');
  });

  it('omits format when not provided', async () => {
    mockFetchResponse(mockWarmSet);
    const resource = makeResource();
    const promise = resource.create('hero-images', 'resize_w_1200');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    const body = JSON.parse(call[1].body as string);
    expect(body.format).toBeUndefined();
  });
});

describe('WarmSetsResource.delete()', () => {
  it('sends DELETE to /api/warm-sets/{id}', async () => {
    mockFetchNoContent();
    const resource = makeResource();
    const promise = resource.delete('ws-abc-123');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/warm-sets/ws-abc-123');
    expect(call[1].method).toBe('DELETE');
  });
});
