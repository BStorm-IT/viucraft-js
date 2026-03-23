import { FetchClient } from '../client/FetchClient';
import { WebhooksResource } from '../resources/WebhooksResource';
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

function makeResource(): WebhooksResource {
  const client = new FetchClient(baseConfig);
  return new WebhooksResource(client);
}

const mockEndpoint = {
  id: 'wh-abc-123',
  url: 'https://example.com/webhook',
  events: ['image.processed', 'batch.completed'],
  created_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  installFetchMock();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('WebhooksResource.list()', () => {
  it('sends GET to /api/webhooks (unversioned path)', async () => {
    mockFetchResponse({ endpoints: [mockEndpoint], limit: 100 });
    const resource = makeResource();
    const promise = resource.list();
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/webhooks');
    expect(call[1].method).toBe('GET');
  });

  it('does NOT use /api/v1/webhooks (versioned path)', async () => {
    mockFetchResponse({ endpoints: [], limit: 100 });
    const resource = makeResource();
    const promise = resource.list();
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).not.toContain('/api/v1/webhooks');
  });
});

describe('WebhooksResource.create()', () => {
  it('sends POST to /api/webhooks with url and events', async () => {
    mockFetchResponse(mockEndpoint);
    const resource = makeResource();
    const promise = resource.create(
      'https://example.com/webhook',
      ['image.processed', 'batch.completed']
    );
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/webhooks');
    expect(call[1].method).toBe('POST');
    const body = JSON.parse(call[1].body as string);
    expect(body.url).toBe('https://example.com/webhook');
    expect(body.events).toEqual(['image.processed', 'batch.completed']);
    expect(result).toEqual(mockEndpoint);
  });

  it('includes description when provided', async () => {
    mockFetchResponse({ ...mockEndpoint, description: 'My webhook' });
    const resource = makeResource();
    const promise = resource.create(
      'https://example.com/webhook',
      ['image.processed'],
      'My webhook'
    );
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    const body = JSON.parse(call[1].body as string);
    expect(body.description).toBe('My webhook');
  });

  it('omits description when not provided', async () => {
    mockFetchResponse(mockEndpoint);
    const resource = makeResource();
    const promise = resource.create('https://example.com/webhook', ['image.processed']);
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    const body = JSON.parse(call[1].body as string);
    expect(body.description).toBeUndefined();
  });
});

describe('WebhooksResource.delete()', () => {
  it('sends DELETE to /api/webhooks/{id}', async () => {
    mockFetchNoContent();
    const resource = makeResource();
    const promise = resource.delete('wh-abc-123');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/webhooks/wh-abc-123');
    expect(call[1].method).toBe('DELETE');
  });
});

describe('WebhooksResource.test()', () => {
  it('sends POST to /api/webhooks/{id}/test', async () => {
    mockFetchResponse({ success: true, statusCode: 200, responseTime: 123 });
    const resource = makeResource();
    const promise = resource.test('wh-abc-123');
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/webhooks/wh-abc-123/test');
    expect(call[1].method).toBe('POST');
    expect(result).toEqual({ success: true, statusCode: 200, responseTime: 123 });
  });
});
