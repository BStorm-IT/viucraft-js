/**
 * Shared fetch mock utilities for all SDK test files.
 * Replaces the old axios mock infrastructure.
 */

export const mockFetch = jest.fn();

/**
 * Install the fetch mock onto globalThis before each test.
 * Call in beforeEach().
 */
export function installFetchMock(): void {
  jest.clearAllMocks();
  globalThis.fetch = mockFetch;
}

/**
 * Mock a successful JSON response.
 */
export function mockFetchResponse(data: unknown, status = 200, headers?: Record<string, string>): void {
  const responseHeaders = new Headers({
    'content-type': 'application/json',
    ...headers,
  });
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : String(status),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: responseHeaders,
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
  } as unknown as Response);
}

/**
 * Mock a 204 No Content response (for DELETE endpoints).
 */
export function mockFetchNoContent(): void {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 204,
    statusText: 'No Content',
    json: () => Promise.reject(new Error('No content')),
    text: () => Promise.resolve(''),
    headers: new Headers(),
  } as unknown as Response);
}

/**
 * Mock a rate-limited 429 response.
 */
export function mockFetchRateLimited(retryAfter?: number): void {
  const headers = new Headers({
    'content-type': 'application/json',
  });
  if (retryAfter !== undefined) {
    headers.set('retry-after', String(retryAfter));
  }
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 429,
    statusText: 'Too Many Requests',
    json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
    text: () => Promise.resolve('{"error":"Rate limit exceeded"}'),
    headers,
  } as unknown as Response);
}

/**
 * Mock a network error (TypeError, as fetch throws TypeError on network failure).
 */
export function mockFetchNetworkError(message = 'Failed to fetch'): void {
  mockFetch.mockRejectedValueOnce(new TypeError(message));
}

/**
 * Mock an AbortError (timeout).
 */
export function mockFetchAbortError(): void {
  const error = new DOMException('The operation was aborted', 'AbortError');
  mockFetch.mockRejectedValueOnce(error);
}

/**
 * Get the most recent fetch call arguments.
 */
export function getLastFetchCall(): [string, RequestInit] | undefined {
  const calls = mockFetch.mock.calls;
  if (calls.length === 0) return undefined;
  return calls[calls.length - 1] as [string, RequestInit];
}

/**
 * Get all fetch call URLs.
 */
export function getFetchCallUrls(): string[] {
  return mockFetch.mock.calls.map((call: unknown[]) => call[0] as string);
}
