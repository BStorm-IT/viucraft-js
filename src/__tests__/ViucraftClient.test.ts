import { ViucraftClient } from '../client/ViucraftClient';
import { ImageBuilder } from '../builder/ImageBuilder';
import { ImagesResource } from '../resources/ImagesResource';
import { BatchResource } from '../resources/BatchResource';
import { WebhooksResource } from '../resources/WebhooksResource';
import { PresetsResource } from '../resources/PresetsResource';
import { WarmSetsResource } from '../resources/WarmSetsResource';
import { AnalyticsResource } from '../resources/AnalyticsResource';
import { UsageResource } from '../resources/UsageResource';
import { DiscoveryResource } from '../resources/DiscoveryResource';
import { ViucraftValidationError } from '../errors';
import type { ViucraftClientConfig } from '../types';
import {
  installFetchMock,
  mockFetchResponse,
  mockFetchNoContent,
} from './helpers/mockFetch';

beforeEach(() => {
  installFetchMock();
});

// Helper to create a client with retry disabled for unit tests
function makeClient(overrides: Partial<ViucraftClientConfig> = {}): ViucraftClient {
  return new ViucraftClient({ apiKey: 'test-api-key-123', retry: false, ...overrides });
}

describe('ViucraftClient', () => {
  describe('constructor', () => {
    it('creates a client with valid config', () => {
      const client = makeClient();
      expect(client).toBeInstanceOf(ViucraftClient);
    });

    it('throws ViucraftValidationError on empty apiKey', () => {
      expect(() => new ViucraftClient({ apiKey: '' })).toThrow(ViucraftValidationError);
    });

    it('throws ViucraftValidationError on whitespace-only apiKey', () => {
      expect(() => new ViucraftClient({ apiKey: '   ' })).toThrow(ViucraftValidationError);
    });

    it('accepts custom baseUrl', () => {
      const client = new ViucraftClient({ apiKey: 'test-key-123', baseUrl: 'https://custom.api.com' });
      expect(client).toBeInstanceOf(ViucraftClient);
    });

    it('accepts custom timeout', () => {
      const client = new ViucraftClient({ apiKey: 'test-key-123', timeout: 5000 });
      expect(client).toBeInstanceOf(ViucraftClient);
    });

    it('warns on HTTP baseUrl', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      new ViucraftClient({ apiKey: 'test-key-123', baseUrl: 'http://insecure.com' });
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('WARNING'));
      warnSpy.mockRestore();
    });

    it('suppresses HTTPS warning with enforceHttps: false', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      new ViucraftClient({ apiKey: 'test-key-123', baseUrl: 'http://insecure.com', enforceHttps: false });
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('accepts retry: false', () => {
      const client = new ViucraftClient({ apiKey: 'test-key-123', retry: false });
      expect(client).toBeInstanceOf(ViucraftClient);
    });
  });

  describe('resource modules', () => {
    it('mounts images as ImagesResource', () => {
      const client = makeClient();
      expect(client.images).toBeInstanceOf(ImagesResource);
    });

    it('mounts batch as BatchResource', () => {
      const client = makeClient();
      expect(client.batch).toBeInstanceOf(BatchResource);
    });

    it('mounts webhooks as WebhooksResource', () => {
      const client = makeClient();
      expect(client.webhooks).toBeInstanceOf(WebhooksResource);
    });

    it('mounts presets as PresetsResource', () => {
      const client = makeClient();
      expect(client.presets).toBeInstanceOf(PresetsResource);
    });

    it('mounts warmSets as WarmSetsResource', () => {
      const client = makeClient();
      expect(client.warmSets).toBeInstanceOf(WarmSetsResource);
    });

    it('mounts analytics as AnalyticsResource', () => {
      const client = makeClient();
      expect(client.analytics).toBeInstanceOf(AnalyticsResource);
    });

    it('mounts usage as UsageResource', () => {
      const client = makeClient();
      expect(client.usage).toBeInstanceOf(UsageResource);
    });

    it('mounts discovery as DiscoveryResource', () => {
      const client = makeClient();
      expect(client.discovery).toBeInstanceOf(DiscoveryResource);
    });

    it('mounts all 8 resource modules', () => {
      const client = makeClient();
      expect(client.images).toBeDefined();
      expect(client.batch).toBeDefined();
      expect(client.webhooks).toBeDefined();
      expect(client.presets).toBeDefined();
      expect(client.warmSets).toBeDefined();
      expect(client.analytics).toBeDefined();
      expect(client.usage).toBeDefined();
      expect(client.discovery).toBeDefined();
    });
  });

  describe('image()', () => {
    it('returns an ImageBuilder instance', () => {
      const client = makeClient();
      const builder = client.image('img-uuid-123');
      expect(builder).toBeInstanceOf(ImageBuilder);
    });

    it('returns ImageBuilder that produces a URL', () => {
      const client = makeClient({ subdomain: 'myapp' });
      const url = client.image('img-uuid-123').toURL();
      expect(typeof url).toBe('string');
      expect(url).toContain('img-uuid-123');
    });

    it('passes subdomain config to ImageBuilder', () => {
      const client = makeClient({ subdomain: 'myapp' });
      const url = client.image('img-uuid-123').toURL();
      expect(url).toContain('myapp.viucraft.com');
    });
  });

  describe('getMaskedApiKey()', () => {
    it('masks a long API key showing first 4 and last 4', () => {
      const client = new ViucraftClient({ apiKey: 'abcdefghijklmnop' });
      expect(client.getMaskedApiKey()).toBe('abcd****mnop');
    });

    it('fully masks short API keys (<=8 chars)', () => {
      const client = new ViucraftClient({ apiKey: 'short12' });
      expect(client.getMaskedApiKey()).toBe('****');
    });

    it('fully masks exactly 8-char keys', () => {
      const client = new ViucraftClient({ apiKey: '12345678' });
      expect(client.getMaskedApiKey()).toBe('****');
    });

    it('shows partial for 9+ char keys', () => {
      const client = new ViucraftClient({ apiKey: '123456789' });
      expect(client.getMaskedApiKey()).toBe('1234****6789');
    });
  });

  describe('updateConfig()', () => {
    it('updates apiKey and re-mounts resource modules', () => {
      const client = makeClient();
      const oldImages = client.images;
      client.updateConfig({ apiKey: 'new-api-key-value' });
      // Resources are re-mounted with new FetchClient
      expect(client.images).toBeInstanceOf(ImagesResource);
      // A new instance is created
      expect(client.images).not.toBe(oldImages);
    });

    it('rejects empty apiKey in update', () => {
      const client = makeClient();
      expect(() => client.updateConfig({ apiKey: '' })).toThrow(ViucraftValidationError);
    });

    it('accepts timeout update', () => {
      const client = makeClient();
      // Should not throw
      expect(() => client.updateConfig({ timeout: 5000 })).not.toThrow();
    });
  });

  describe('deprecated uploadImage()', () => {
    it('delegates to client.images.upload()', async () => {
      const client = makeClient();
      const uploadSpy = jest.spyOn(client.images, 'upload').mockResolvedValue({
        status: 'success',
        image_id: 'img-abc',
      });

      const file = new Blob(['fake'], { type: 'image/jpeg' });
      const result = await client.uploadImage(file);

      expect(uploadSpy).toHaveBeenCalledWith(file, undefined);
      expect(result).toEqual({ status: 'success', image_id: 'img-abc' });
    });

    it('passes folder from metadata to upload options', async () => {
      const client = makeClient();
      const uploadSpy = jest.spyOn(client.images, 'upload').mockResolvedValue({
        status: 'success',
        image_id: 'img-abc',
      });

      const file = new Blob(['fake'], { type: 'image/jpeg' });
      await client.uploadImage(file, { folder: 'my-folder' });

      expect(uploadSpy).toHaveBeenCalledWith(file, { folder: 'my-folder' });
    });
  });

  describe('deprecated deleteImage()', () => {
    it('delegates to client.images.delete()', async () => {
      const client = makeClient();
      const deleteSpy = jest.spyOn(client.images, 'delete').mockResolvedValue(undefined);

      const result = await client.deleteImage('img-uuid-123');

      expect(deleteSpy).toHaveBeenCalledWith('img-uuid-123');
      expect(result).toEqual({ success: true, message: 'Image deleted successfully' });
    });
  });

  describe('deprecated listImages()', () => {
    it('delegates to client.images.list() with page and limit', async () => {
      const client = makeClient();
      const listSpy = jest.spyOn(client.images, 'list').mockResolvedValue({
        images: [],
        pagination: { total: 42, page: 2, limit: 10 },
      });

      const result = await client.listImages(2, 10);

      expect(listSpy).toHaveBeenCalledWith({ page: 2, limit: 10 });
      // Maps v2 nested pagination to v1 flat shape
      expect(result).toEqual({
        images: [],
        total: 42,
        page: 2,
        limit: 10,
      });
    });

    it('uses default page=1, limit=20', async () => {
      const client = makeClient();
      const listSpy = jest.spyOn(client.images, 'list').mockResolvedValue({
        images: [],
        pagination: { total: 0, page: 1, limit: 20 },
      });

      await client.listImages();

      expect(listSpy).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe('API surface: removed methods', () => {
    it('does NOT have buildImageUrl()', () => {
      const client = makeClient();
      expect((client as unknown as Record<string, unknown>).buildImageUrl).toBeUndefined();
    });

    it('does NOT have getImageInfo()', () => {
      const client = makeClient();
      expect((client as unknown as Record<string, unknown>).getImageInfo).toBeUndefined();
    });
  });
});
