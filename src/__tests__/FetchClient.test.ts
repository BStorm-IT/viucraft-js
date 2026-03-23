import { FetchClient } from '../client/FetchClient';
import {
  ViucraftError,
  ViucraftRateLimitError,
  ViucraftNetworkError,
  ViucraftTimeoutError,
} from '../errors';
import {
  mockFetch,
  installFetchMock,
  mockFetchResponse,
  mockFetchNoContent,
  mockFetchRateLimited,
  mockFetchNetworkError,
  mockFetchAbortError,
  getLastFetchCall,
} from './helpers/mockFetch';
import { ResolvedClientConfig } from '../types';

const baseConfig: ResolvedClientConfig = {
  apiKey: 'test-key-12345',
  baseUrl: 'https://api.viucraft.com',
  timeout: 5000,
  retry: {
    maxRetries: 2,
    initialDelayMs: 100,
    maxDelayMs: 1000,
    backoffMultiplier: 2,
  },
};

function makeClient(overrides: Partial<ResolvedClientConfig> = {}): FetchClient {
  return new FetchClient({ ...baseConfig, ...overrides });
}

beforeEach(() => {
  installFetchMock();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('FetchClient - auth headers', () => {
  it('sends GET request with X-API-Key header', async () => {
    mockFetchResponse({ ok: true });
    const client = makeClient();
    const promise = client.get('/images');
    jest.runAllTimers();
    await promise;
    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/images');
    expect(call[1].method).toBe('GET');
    expect((call[1].headers as Record<string, string>)['X-API-Key']).toBe('test-key-12345');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.viucraft.com/images',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-API-Key': 'test-key-12345' }),
      })
    );
  });

  it('sends POST request with JSON body and Content-Type: application/json', async () => {
    mockFetchResponse({ ok: true });
    const client = makeClient();
    const promise = client.post('/images', { name: 'test' });
    jest.runAllTimers();
    await promise;
    const call = getLastFetchCall()!;
    expect(call[1].method).toBe('POST');
    expect((call[1].headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(call[1].body).toBe(JSON.stringify({ name: 'test' }));
  });

  it('sends POST with FormData without Content-Type header', async () => {
    mockFetchResponse({ ok: true });
    const client = makeClient();
    const formData = new FormData();
    formData.append('file', 'data');
    const promise = client.post('/upload', formData);
    jest.runAllTimers();
    await promise;
    const call = getLastFetchCall()!;
    expect(call[1].method).toBe('POST');
    expect(call[1].headers as Record<string, string>).not.toHaveProperty('Content-Type');
  });

  it('sends DELETE request', async () => {
    mockFetchNoContent();
    const client = makeClient();
    const promise = client.delete('/images/abc123');
    jest.runAllTimers();
    await promise;
    const call = getLastFetchCall()!;
    expect(call[1].method).toBe('DELETE');
  });

  it('sends PUT request with JSON body', async () => {
    mockFetchResponse({ ok: true });
    const client = makeClient();
    const promise = client.put('/images/abc123', { name: 'updated' });
    jest.runAllTimers();
    await promise;
    const call = getLastFetchCall()!;
    expect(call[1].method).toBe('PUT');
    expect((call[1].headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });
});

describe('FetchClient - query params', () => {
  it('appends query params to URL for GET requests', async () => {
    mockFetchResponse({ images: [] });
    const client = makeClient();
    const promise = client.get('/images', { params: { page: 1, limit: 20 } });
    jest.runAllTimers();
    await promise;
    const call = getLastFetchCall()!;
    expect(call[0]).toContain('page=1');
    expect(call[0]).toContain('limit=20');
  });

  it('skips undefined values in query params', async () => {
    mockFetchResponse({ images: [] });
    const client = makeClient();
    const promise = client.get('/images', { params: { page: 1, limit: undefined } });
    jest.runAllTimers();
    await promise;
    const call = getLastFetchCall()!;
    expect(call[0]).toContain('page=1');
    expect(call[0]).not.toContain('limit');
  });
});

describe('FetchClient - timeout', () => {
  it('throws ViucraftTimeoutError when AbortController fires', async () => {
    mockFetchAbortError();
    const client = makeClient();
    const promise = client.get('/images');
    jest.runAllTimers();
    const error = await promise.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ViucraftTimeoutError);
    expect((error as ViucraftTimeoutError).timeoutMs).toBe(5000);
    expect((error as ViucraftTimeoutError).code).toBe('TIMEOUT_ERROR');
  });

  it('AbortError is wrapped as ViucraftTimeoutError', async () => {
    mockFetchAbortError();
    const client = makeClient();
    const promise = client.get('/test');
    jest.runAllTimers();
    const error = await promise.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ViucraftTimeoutError);
    expect((error as ViucraftTimeoutError).timeoutMs).toBe(5000);
  });
});

describe('FetchClient - network errors', () => {
  it('TypeError from fetch is caught and wrapped as ViucraftNetworkError', async () => {
    mockFetchNetworkError('Failed to fetch');
    const client = makeClient({ retry: false });
    const promise = client.get('/images');
    jest.runAllTimers();
    const error = await promise.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ViucraftNetworkError);
    expect((error as ViucraftNetworkError).code).toBe('NETWORK_ERROR');
    expect((error as ViucraftNetworkError).message).toBe('Failed to fetch');
  });
});

describe('FetchClient - retry logic', () => {
  it('HTTP 429 response triggers retry with exponential backoff', async () => {
    mockFetchRateLimited(); // first call: 429
    mockFetchRateLimited(); // second call: 429
    mockFetchResponse({ ok: true }); // third call: 200
    const client = makeClient();
    const promise = client.get('/images');
    // Run all timers to process backoff delays
    await jest.runAllTimersAsync();
    const result = await promise;
    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('HTTP 429 with Retry-After header uses that value for delay', async () => {
    mockFetchRateLimited(5); // retry-after: 5 seconds
    mockFetchResponse({ ok: true });
    const client = makeClient();
    const promise = client.get('/images');
    await jest.runAllTimersAsync();
    await promise;
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('HTTP 429 after maxRetries throws ViucraftRateLimitError', async () => {
    // maxRetries = 2, so 3 total calls all returning 429
    mockFetchRateLimited();
    mockFetchRateLimited();
    mockFetchRateLimited();
    const client = makeClient();
    // Interleave timer advancement with awaiting to allow retry delays to resolve
    const resultPromise = client.get('/images').catch((e: unknown) => e);
    await jest.runAllTimersAsync();
    const error = await resultPromise;
    expect(error).toBeInstanceOf(ViucraftRateLimitError);
    expect((error as ViucraftRateLimitError).code).toBe('RATE_LIMIT_ERROR');
  });

  it('retry=false disables all retry logic', async () => {
    mockFetchRateLimited();
    const client = makeClient({ retry: false });
    const promise = client.get('/images');
    jest.runAllTimers();
    const error = await promise.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ViucraftRateLimitError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('FetchClient - error responses', () => {
  it('HTTP 400 response throws ViucraftError with status 400', async () => {
    mockFetchResponse({ error_message: 'Bad request' }, 400);
    const client = makeClient({ retry: false });
    const promise = client.get('/images');
    jest.runAllTimers();
    const error = await promise.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ViucraftError);
    expect((error as ViucraftError).status).toBe(400);
  });

  it('HTTP 500 response throws ViucraftError with error_message from body', async () => {
    mockFetchResponse({ error_message: 'Internal server error' }, 500);
    const client = makeClient({ retry: false });
    const promise = client.get('/images');
    jest.runAllTimers();
    const error = await promise.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ViucraftError);
    expect((error as ViucraftError).status).toBe(500);
    expect((error as ViucraftError).message).toBe('Internal server error');
  });

  it('HTTP 204 No Content returns undefined', async () => {
    mockFetchNoContent();
    const client = makeClient();
    const promise = client.delete('/images/abc123');
    jest.runAllTimers();
    const result = await promise;
    expect(result).toBeUndefined();
  });

  it('successful JSON response returns parsed body', async () => {
    const data = { id: 'img-001', width: 1920, height: 1080 };
    mockFetchResponse(data);
    const client = makeClient();
    const promise = client.get('/images/img-001');
    jest.runAllTimers();
    const result = await promise;
    expect(result).toEqual(data);
  });
});
