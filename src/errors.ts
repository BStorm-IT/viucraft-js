import { RateLimitInfo } from './types';

/**
 * Base error class for all Viucraft SDK errors.
 */
export class ViucraftError extends Error {
  /** Machine-readable error code */
  public readonly code: string;
  /** HTTP status code, if applicable */
  public readonly status?: number;
  /** Rate limit information from response headers */
  public readonly rateLimit?: RateLimitInfo;
  /** Raw response data from the API */
  public readonly responseData?: unknown;

  constructor(
    message: string,
    code: string = 'VIUCRAFT_ERROR',
    status?: number,
    rateLimit?: RateLimitInfo,
    responseData?: unknown
  ) {
    super(message);
    this.name = 'ViucraftError';
    this.code = code;
    this.status = status;
    this.rateLimit = rateLimit;
    this.responseData = responseData;
    Object.setPrototypeOf(this, ViucraftError.prototype);
  }
}

/**
 * Thrown when client-side validation fails (e.g. invalid dimensions, out-of-range values).
 */
export class ViucraftValidationError extends ViucraftError {
  /** The name of the parameter that failed validation */
  public readonly parameterName: string;

  constructor(message: string, parameterName: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ViucraftValidationError';
    this.parameterName = parameterName;
    Object.setPrototypeOf(this, ViucraftValidationError.prototype);
  }
}

/**
 * Thrown when the API responds with HTTP 429 (Too Many Requests).
 */
export class ViucraftRateLimitError extends ViucraftError {
  /** Number of seconds to wait before retrying */
  public readonly retryAfter?: number;

  constructor(
    message: string,
    retryAfter?: number,
    rateLimit?: RateLimitInfo,
    responseData?: unknown
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, rateLimit, responseData);
    this.name = 'ViucraftRateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, ViucraftRateLimitError.prototype);
  }
}

/**
 * Thrown on connection failures, timeouts, and other network-level errors.
 */
export class ViucraftNetworkError extends ViucraftError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'ViucraftNetworkError';
    Object.setPrototypeOf(this, ViucraftNetworkError.prototype);
  }
}

/**
 * Thrown when a request exceeds the configured timeout.
 */
export class ViucraftTimeoutError extends ViucraftError {
  /** The timeout duration in milliseconds */
  public readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number) {
    super(message, 'TIMEOUT_ERROR');
    this.name = 'ViucraftTimeoutError';
    this.timeoutMs = timeoutMs;
    Object.setPrototypeOf(this, ViucraftTimeoutError.prototype);
  }
}
