import { FetchClient } from '../client/FetchClient';
import { ImagesResource } from '../resources/ImagesResource';
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

function makeResource(): ImagesResource {
  const client = new FetchClient(baseConfig);
  return new ImagesResource(client);
}

beforeEach(() => {
  installFetchMock();
});

describe('ImagesResource.upload()', () => {
  it('sends POST to /api/v1/cli/images/upload with FormData', async () => {
    mockFetchResponse({ status: 'success', image_id: 'img-123' });
    const resource = makeResource();
    const file = new Blob(['fake image data'], { type: 'image/jpeg' });
    const promise = resource.upload(file);

    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/cli/images/upload');
    expect(call[1].method).toBe('POST');
    expect(call[1].body).toBeInstanceOf(FormData);
    expect(result).toEqual({ status: 'success', image_id: 'img-123' });
  });

  it('uses field name "file" (not "image") in FormData', async () => {
    mockFetchResponse({ status: 'success', image_id: 'img-456' });
    const resource = makeResource();
    const file = new Blob(['data'], { type: 'image/jpeg' });
    const promise = resource.upload(file);

    await promise;

    const call = getLastFetchCall()!;
    const formData = call[1].body as FormData;
    expect(formData.get('file')).toBeInstanceOf(Blob);
    expect(formData.get('image')).toBeNull();
  });

  it('appends folder to FormData when provided', async () => {
    mockFetchResponse({ status: 'success', image_id: 'img-789' });
    const resource = makeResource();
    const file = new Blob(['data']);
    const promise = resource.upload(file, { folder: 'my-folder' });

    await promise;

    const call = getLastFetchCall()!;
    const formData = call[1].body as FormData;
    expect(formData.get('folder')).toBe('my-folder');
  });

  it('does NOT set Content-Type header manually', async () => {
    mockFetchResponse({ status: 'success', image_id: 'img-111' });
    const resource = makeResource();
    const file = new Blob(['data']);
    const promise = resource.upload(file);

    await promise;

    const call = getLastFetchCall()!;
    const headers = call[1].headers as Record<string, string>;
    expect(headers['Content-Type']).toBeUndefined();
  });
});

describe('ImagesResource.list()', () => {
  it('sends GET to /api/v1/cli/images', async () => {
    mockFetchResponse({ images: [], pagination: { limit: 20, page: 1, total: 0 } });
    const resource = makeResource();
    const promise = resource.list();

    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/cli/images');
    expect(call[1].method).toBe('GET');
  });

  it('sends page, limit, and q as query params', async () => {
    mockFetchResponse({ images: [], pagination: { limit: 10, page: 2, total: 50 } });
    const resource = makeResource();
    const promise = resource.list({ page: 2, limit: 10, q: 'cat' });

    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toContain('page=2');
    expect(call[0]).toContain('limit=10');
    expect(call[0]).toContain('q=cat');
  });
});

describe('ImagesResource.delete()', () => {
  it('sends DELETE to /api/v1/cli/images/{imageId}', async () => {
    mockFetchNoContent();
    const resource = makeResource();
    const promise = resource.delete('img-abc-123');

    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/cli/images/img-abc-123');
    expect(call[1].method).toBe('DELETE');
  });

  it('throws ViucraftValidationError when imageId is empty', async () => {
    const resource = makeResource();
    await expect(resource.delete('')).rejects.toThrow('imageId must be a non-empty string');
  });
});

describe('ImagesResource.transform()', () => {
  it('sends POST to /api/v1/cli/images/transform with uuid and operations', async () => {
    mockFetchResponse({ url: 'https://cdn.viucraft.com/transformed.jpg', cached: false });
    const resource = makeResource();
    const promise = resource.transform('img-def-456', 'resize_w_800_h_600');

    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/cli/images/transform');
    expect(call[1].method).toBe('POST');
    const body = JSON.parse(call[1].body as string);
    expect(body.uuid).toBe('img-def-456');
    expect(body.operations).toBe('resize_w_800_h_600');
    expect(result).toEqual({ url: 'https://cdn.viucraft.com/transformed.jpg', cached: false });
  });

  it('includes format in body when provided', async () => {
    mockFetchResponse({ url: 'https://cdn.viucraft.com/out.webp', cached: true });
    const resource = makeResource();
    const promise = resource.transform('img-xyz', 'grayscale', 'webp');

    await promise;

    const call = getLastFetchCall()!;
    const body = JSON.parse(call[1].body as string);
    expect(body.format).toBe('webp');
  });

  it('throws ViucraftValidationError when imageId is empty', async () => {
    const resource = makeResource();
    await expect(resource.transform('', 'resize_w_100')).rejects.toThrow(
      'imageId must be a non-empty string'
    );
  });
});
