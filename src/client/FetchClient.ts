import {
  ResolvedClientConfig,
  RequestOptions,
  RateLimitInfo,
  RetryConfig,
} from '../types';
import {
  ViucraftError,
  ViucraftRateLimitError,
  ViucraftNetworkError,
  ViucraftTimeoutError,
} from '../errors';

/**
 * Internal HTTP abstraction that wraps native fetch.
 * All resource modules and ViucraftClient delegate to this class.
 *
 * Responsibilities:
 * - Attaches X-API-Key auth header to every request
 * - Enforces request timeout via AbortController
 * - Retries on HTTP 429 with exponential backoff (respects Retry-After header)
 * - Maps fetch errors/responses to the SDK error hierarchy
 */
export class FetchClient {
  constructor(private readonly config: ResolvedClientConfig) {}

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.requestWithRetry<T>('GET', path, options);
  }

  async post<T>(
    path: string,
    body?: BodyInit | Record<string, unknown>,
    options?: RequestOptions
  ): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const isBodyInit =
      body instanceof ArrayBuffer ||
      body instanceof Blob ||
      typeof body === 'string' ||
      body instanceof URLSearchParams ||
      (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream);

    let finalBody: BodyInit | undefined;
    let contentTypeHeader: Record<string, string> = {};

    if (isFormData || isBodyInit) {
      finalBody = body as BodyInit;
      // Do NOT set Content-Type — fetch handles multipart boundaries automatically
    } else if (body !== undefined && body !== null) {
      finalBody = JSON.stringify(body);
      contentTypeHeader = { 'Content-Type': 'application/json' };
    }

    return this.requestWithRetry<T>('POST', path, {
      ...options,
      headers: { ...contentTypeHeader, ...options?.headers },
      body: finalBody,
    });
  }

  async put<T>(
    path: string,
    body?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<T> {
    const finalBody = body !== undefined ? JSON.stringify(body) : undefined;
    const contentTypeHeader: Record<string, string> =
      body !== undefined ? { 'Content-Type': 'application/json' } : {};

    return this.requestWithRetry<T>('PUT', path, {
      ...options,
      headers: { ...contentTypeHeader, ...options?.headers },
      body: finalBody,
    });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.requestWithRetry<T>('DELETE', path, options);
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | undefined>
  ): string {
    const url = this.config.baseUrl + path;
    if (!params) return url;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    return qs ? `${url}?${qs}` : url;
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      'X-API-Key': this.config.apiKey,
      ...extra,
    };
  }

  private async requestWithRetry<T>(
    method: string,
    path: string,
    options?: RequestOptions
  ): Promise<T> {
    const retryConfig: RetryConfig | false = this.config.retry;
    const maxRetries = retryConfig === false ? 0 : retryConfig.maxRetries;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        const url = this.buildUrl(path, options?.params);
        const response = await fetch(url, {
          method,
          headers: this.buildHeaders(options?.headers),
          body: options?.body,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // Handle 429 with retry (only if retry is enabled and attempts remain)
        if (response.status === 429 && retryConfig !== false && attempt < maxRetries) {
          const retryAfterSec = this.parseRetryAfter(response.headers);
          const backoffDelay =
            retryConfig.initialDelayMs *
            Math.pow(retryConfig.backoffMultiplier ?? 2, attempt);
          const delayMs =
            retryAfterSec !== undefined
              ? retryAfterSec * 1000
              : Math.min(backoffDelay, retryConfig.maxDelayMs ?? 30000);
          await this.delay(delayMs);
          continue;
        }

        if (!response.ok) {
          await this.throwFromResponse(response);
        }

        // 204 No Content — return undefined
        if (response.status === 204) {
          return undefined as T;
        }

        return response.json() as Promise<T>;
      } catch (error) {
        clearTimeout(timeoutId);

        // Already a Viucraft SDK error — rethrow directly
        if (error instanceof ViucraftError) {
          throw error;
        }

        // AbortError or TimeoutError from AbortController
        if (
          error instanceof DOMException &&
          (error.name === 'AbortError' || error.name === 'TimeoutError')
        ) {
          throw new ViucraftTimeoutError(
            `Request timed out after ${this.config.timeout}ms`,
            this.config.timeout
          );
        }

        // TypeError = network failure (fetch throws TypeError on connection errors)
        if (error instanceof TypeError) {
          throw new ViucraftNetworkError(error.message);
        }

        // Unknown error on last attempt
        if (attempt >= maxRetries) {
          const msg =
            error instanceof Error ? error.message : 'Unknown error';
          throw new ViucraftNetworkError(msg);
        }
      }
    }

    // Should never reach here, but TypeScript requires a return path
    throw new ViucraftNetworkError('Request failed after maximum retries');
  }

  private parseRetryAfter(headers: Headers): number | undefined {
    const retryAfter = headers.get('retry-after');
    if (retryAfter !== null) {
      const seconds = Number(retryAfter);
      if (!isNaN(seconds) && seconds > 0) {
        return seconds;
      }
    }
    // Fall back to x-ratelimit-reset (epoch timestamp)
    const reset = headers.get('x-ratelimit-reset');
    if (reset !== null) {
      const resetTime = Number(reset);
      if (!isNaN(resetTime)) {
        const now = Math.floor(Date.now() / 1000);
        const diff = resetTime - now;
        return diff > 0 ? diff : 1;
      }
    }
    return undefined;
  }

  private extractRateLimitInfo(headers: Headers): RateLimitInfo | undefined {
    const limit = headers.get('x-ratelimit-limit');
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');

    if (limit === null && remaining === null && reset === null) {
      return undefined;
    }

    return {
      limit: limit !== null ? Number(limit) : undefined,
      remaining: remaining !== null ? Number(remaining) : undefined,
      reset: reset !== null ? Number(reset) : undefined,
    };
  }

  private async throwFromResponse(response: Response): Promise<never> {
    const rateLimit = this.extractRateLimitInfo(response.headers);
    let data: Record<string, unknown> | undefined;

    try {
      data = (await response.json()) as Record<string, unknown>;
    } catch {
      // Response body may not be JSON — ignore parse error
    }

    if (response.status === 429) {
      const retryAfter = this.parseRetryAfter(response.headers);
      throw new ViucraftRateLimitError(
        'Rate limit exceeded',
        retryAfter,
        rateLimit,
        data
      );
    }

    const message =
      (data?.error_message as string) ||
      (data?.message as string) ||
      (data?.error as string) ||
      `API error: ${response.status}`;

    throw new ViucraftError(
      message,
      'API_ERROR',
      response.status,
      rateLimit,
      data
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
