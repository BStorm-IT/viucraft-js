import { FetchClient } from '../client/FetchClient';
import { AnalyticsResource } from '../resources/AnalyticsResource';
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

function makeResource(): AnalyticsResource {
  const client = new FetchClient(baseConfig);
  return new AnalyticsResource(client);
}

const TEST_IMAGE_ID = 'img-abc-123';

beforeEach(() => {
  installFetchMock();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('AnalyticsResource.metadata()', () => {
  it('sends GET to /api/v1/images/{imageId}/metadata', async () => {
    mockFetchResponse({
      width: 1920,
      height: 1080,
      format: 'jpeg',
      size: 245678,
      has_alpha: false,
      color_space: 'srgb',
    });
    const resource = makeResource();
    const promise = resource.metadata(TEST_IMAGE_ID);
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe(`https://api.viucraft.com/api/v1/images/${TEST_IMAGE_ID}/metadata`);
    expect(call[1].method).toBe('GET');
    expect(result.width).toBe(1920);
    expect(result.format).toBe('jpeg');
  });

  it('throws ViucraftValidationError when imageId is empty', async () => {
    const resource = makeResource();
    await expect(resource.metadata('')).rejects.toThrow('imageId must be a non-empty string');
  });
});

describe('AnalyticsResource.colors()', () => {
  it('sends GET to /api/v1/images/{imageId}/colors', async () => {
    mockFetchResponse([{ hex: '#ff0000', percentage: 45.5 }, { hex: '#0000ff', percentage: 30.2 }]);
    const resource = makeResource();
    const promise = resource.colors(TEST_IMAGE_ID);
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe(`https://api.viucraft.com/api/v1/images/${TEST_IMAGE_ID}/colors`);
    expect(call[1].method).toBe('GET');
    expect(Array.isArray(result)).toBe(true);
  });

  it('sends count as query param when provided', async () => {
    mockFetchResponse([{ hex: '#ff0000', percentage: 100 }]);
    const resource = makeResource();
    const promise = resource.colors(TEST_IMAGE_ID, 3);
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toContain('count=3');
  });

  it('does NOT send count param when not provided', async () => {
    mockFetchResponse([]);
    const resource = makeResource();
    const promise = resource.colors(TEST_IMAGE_ID);
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).not.toContain('count=');
  });

  it('throws ViucraftValidationError when imageId is empty', async () => {
    const resource = makeResource();
    await expect(resource.colors('')).rejects.toThrow('imageId must be a non-empty string');
  });
});

describe('AnalyticsResource.quality()', () => {
  it('sends GET to /api/v1/images/{imageId}/quality', async () => {
    mockFetchResponse({ score: 87.5, details: { sharpness: 90, noise: 85 } });
    const resource = makeResource();
    const promise = resource.quality(TEST_IMAGE_ID);
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe(`https://api.viucraft.com/api/v1/images/${TEST_IMAGE_ID}/quality`);
    expect(call[1].method).toBe('GET');
    expect(result.score).toBe(87.5);
  });

  it('throws ViucraftValidationError when imageId is empty', async () => {
    const resource = makeResource();
    await expect(resource.quality('')).rejects.toThrow('imageId must be a non-empty string');
  });
});

describe('AnalyticsResource.recommend()', () => {
  it('sends GET to /api/v1/images/{imageId}/recommend', async () => {
    mockFetchResponse([
      { format: 'webp', estimated_size: 45000, quality_score: 95 },
      { format: 'avif', estimated_size: 38000, quality_score: 94 },
    ]);
    const resource = makeResource();
    const promise = resource.recommend(TEST_IMAGE_ID);
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe(`https://api.viucraft.com/api/v1/images/${TEST_IMAGE_ID}/recommend`);
    expect(call[1].method).toBe('GET');
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].format).toBe('webp');
  });

  it('throws ViucraftValidationError when imageId is empty', async () => {
    const resource = makeResource();
    await expect(resource.recommend('')).rejects.toThrow('imageId must be a non-empty string');
  });
});

describe('AnalyticsResource.breakpoints()', () => {
  it('sends GET to /api/v1/images/{imageId}/breakpoints', async () => {
    mockFetchResponse({ widths: [320, 640, 1280, 1920], format: 'webp' });
    const resource = makeResource();
    const promise = resource.breakpoints(TEST_IMAGE_ID);
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe(`https://api.viucraft.com/api/v1/images/${TEST_IMAGE_ID}/breakpoints`);
    expect(call[1].method).toBe('GET');
    expect(result.widths).toEqual([320, 640, 1280, 1920]);
  });

  it('sends format as query param when provided', async () => {
    mockFetchResponse({ widths: [320, 640], format: 'avif' });
    const resource = makeResource();
    const promise = resource.breakpoints(TEST_IMAGE_ID, 'avif');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toContain('format=avif');
  });

  it('does NOT send format param when not provided', async () => {
    mockFetchResponse({ widths: [320], format: 'webp' });
    const resource = makeResource();
    const promise = resource.breakpoints(TEST_IMAGE_ID);
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).not.toContain('format=');
  });

  it('throws ViucraftValidationError when imageId is empty', async () => {
    const resource = makeResource();
    await expect(resource.breakpoints('')).rejects.toThrow('imageId must be a non-empty string');
  });
});
