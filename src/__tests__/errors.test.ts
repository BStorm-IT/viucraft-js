import {
  ViucraftError,
  ViucraftValidationError,
  ViucraftRateLimitError,
  ViucraftNetworkError,
  ViucraftTimeoutError,
} from '../errors';

describe('ViucraftError', () => {
  it('should create an instance with default values', () => {
    const error = new ViucraftError('something went wrong');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ViucraftError);
    expect(error.message).toBe('something went wrong');
    expect(error.name).toBe('ViucraftError');
    expect(error.code).toBe('VIUCRAFT_ERROR');
    expect(error.status).toBeUndefined();
    expect(error.rateLimit).toBeUndefined();
    expect(error.responseData).toBeUndefined();
  });

  it('should accept all optional parameters', () => {
    const rateLimit = { limit: 100, remaining: 0, reset: 1700000000 };
    const responseData = { error_message: 'Too many requests' };
    const error = new ViucraftError('API error', 'API_ERROR', 500, rateLimit, responseData);
    expect(error.code).toBe('API_ERROR');
    expect(error.status).toBe(500);
    expect(error.rateLimit).toEqual(rateLimit);
    expect(error.responseData).toEqual(responseData);
  });
});

describe('ViucraftValidationError', () => {
  it('should create an instance with parameterName', () => {
    const error = new ViucraftValidationError('width must be positive', 'width');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ViucraftError);
    expect(error).toBeInstanceOf(ViucraftValidationError);
    expect(error.name).toBe('ViucraftValidationError');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.parameterName).toBe('width');
    expect(error.message).toBe('width must be positive');
  });

  it('should not be an instance of other error subclasses', () => {
    const error = new ViucraftValidationError('bad input', 'x');
    expect(error).not.toBeInstanceOf(ViucraftRateLimitError);
    expect(error).not.toBeInstanceOf(ViucraftNetworkError);
  });
});

describe('ViucraftRateLimitError', () => {
  it('should create an instance with retryAfter', () => {
    const rateLimit = { limit: 60, remaining: 0 };
    const error = new ViucraftRateLimitError('Rate limit exceeded', 30, rateLimit, { blocked: true });
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ViucraftError);
    expect(error).toBeInstanceOf(ViucraftRateLimitError);
    expect(error.name).toBe('ViucraftRateLimitError');
    expect(error.code).toBe('RATE_LIMIT_ERROR');
    expect(error.status).toBe(429);
    expect(error.retryAfter).toBe(30);
    expect(error.rateLimit).toEqual(rateLimit);
    expect(error.responseData).toEqual({ blocked: true });
  });

  it('should handle undefined retryAfter', () => {
    const error = new ViucraftRateLimitError('Rate limit exceeded');
    expect(error.retryAfter).toBeUndefined();
    expect(error.rateLimit).toBeUndefined();
  });
});

describe('ViucraftNetworkError', () => {
  it('should create an instance', () => {
    const error = new ViucraftNetworkError('Connection timeout');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ViucraftError);
    expect(error).toBeInstanceOf(ViucraftNetworkError);
    expect(error.name).toBe('ViucraftNetworkError');
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('Connection timeout');
    expect(error.status).toBeUndefined();
  });

  it('should not be an instance of other error subclasses', () => {
    const error = new ViucraftNetworkError('timeout');
    expect(error).not.toBeInstanceOf(ViucraftValidationError);
    expect(error).not.toBeInstanceOf(ViucraftRateLimitError);
  });
});

describe('ViucraftTimeoutError', () => {
  it('should extend ViucraftError', () => {
    const error = new ViucraftTimeoutError('timed out', 5000);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ViucraftError);
    expect(error).toBeInstanceOf(ViucraftTimeoutError);
  });

  it('should have correct name and code', () => {
    const error = new ViucraftTimeoutError('timed out', 5000);
    expect(error.name).toBe('ViucraftTimeoutError');
    expect(error.code).toBe('TIMEOUT_ERROR');
    expect(error.message).toBe('timed out');
  });

  it('should store timeoutMs', () => {
    const error = new ViucraftTimeoutError('timed out', 30000);
    expect(error.timeoutMs).toBe(30000);
  });
});
