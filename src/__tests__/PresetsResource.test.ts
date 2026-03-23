import { FetchClient } from '../client/FetchClient';
import { PresetsResource } from '../resources/PresetsResource';
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

function makeResource(): PresetsResource {
  const client = new FetchClient(baseConfig);
  return new PresetsResource(client);
}

const mockPreset = {
  name: 'thumbnail',
  operations: ['resize_w_200_h_200', 'quality_80'],
  type: 'custom' as const,
};

beforeEach(() => {
  installFetchMock();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('PresetsResource.list()', () => {
  it('sends GET to /api/v1/presets', async () => {
    mockFetchResponse({ presets: [mockPreset] });
    const resource = makeResource();
    const promise = resource.list();
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/presets');
    expect(call[1].method).toBe('GET');
  });
});

describe('PresetsResource.get()', () => {
  it('sends GET to /api/v1/presets/{name}', async () => {
    mockFetchResponse(mockPreset);
    const resource = makeResource();
    const promise = resource.get('thumbnail');
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/presets/thumbnail');
    expect(call[1].method).toBe('GET');
    expect(result).toEqual(mockPreset);
  });

  it('URL-encodes preset name with special characters', async () => {
    mockFetchResponse(mockPreset);
    const resource = makeResource();
    const promise = resource.get('my preset/v2');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/presets/my%20preset%2Fv2');
  });
});

describe('PresetsResource.create()', () => {
  it('sends POST to /api/v1/presets with name and operations', async () => {
    mockFetchResponse(mockPreset);
    const resource = makeResource();
    const promise = resource.create('thumbnail', ['resize_w_200_h_200', 'quality_80']);
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/presets');
    expect(call[1].method).toBe('POST');
    const body = JSON.parse(call[1].body as string);
    expect(body.name).toBe('thumbnail');
    expect(body.operations).toEqual(['resize_w_200_h_200', 'quality_80']);
    expect(result).toEqual(mockPreset);
  });

  it('includes description when provided', async () => {
    mockFetchResponse(mockPreset);
    const resource = makeResource();
    const promise = resource.create(
      'thumbnail',
      ['resize_w_200'],
      { description: 'Small thumbnail preset' }
    );
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    const body = JSON.parse(call[1].body as string);
    expect(body.description).toBe('Small thumbnail preset');
  });

  it('omits description when not provided', async () => {
    mockFetchResponse(mockPreset);
    const resource = makeResource();
    const promise = resource.create('thumbnail', ['resize_w_200']);
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    const body = JSON.parse(call[1].body as string);
    expect(body.description).toBeUndefined();
  });
});

describe('PresetsResource.delete()', () => {
  it('sends DELETE to /api/v1/presets/{name}', async () => {
    mockFetchNoContent();
    const resource = makeResource();
    const promise = resource.delete('thumbnail');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/presets/thumbnail');
    expect(call[1].method).toBe('DELETE');
  });

  it('URL-encodes preset name with special characters in DELETE', async () => {
    mockFetchNoContent();
    const resource = makeResource();
    const promise = resource.delete('my preset');
    jest.runAllTimers();
    await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/v1/presets/my%20preset');
  });
});
