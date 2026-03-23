import { FetchClient } from '../client/FetchClient';
import { DiscoveryResource } from '../resources/DiscoveryResource';
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

function makeResource(): DiscoveryResource {
  const client = new FetchClient(baseConfig);
  return new DiscoveryResource(client);
}

beforeEach(() => {
  installFetchMock();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('DiscoveryResource.capabilities()', () => {
  it('sends GET to /api/capabilities', async () => {
    mockFetchResponse({
      capabilities: [
        { name: 'resize', enabled: true },
        { name: 'batch', enabled: true, limit: 1000 },
        { name: 'webhooks', enabled: true },
      ],
      plan: 'professional',
    });
    const resource = makeResource();
    const promise = resource.capabilities();
    jest.runAllTimers();
    const result = await promise;

    const call = getLastFetchCall()!;
    expect(call[0]).toBe('https://api.viucraft.com/api/capabilities');
    expect(call[1].method).toBe('GET');
    expect(result.plan).toBe('professional');
    expect(result.capabilities).toHaveLength(3);
  });

  it('returns typed CapabilitiesResponse with capabilities array and plan', async () => {
    const mockResponse = {
      capabilities: [{ name: 'resize', enabled: true }],
      plan: 'basic',
    };
    mockFetchResponse(mockResponse);
    const resource = makeResource();
    const promise = resource.capabilities();
    jest.runAllTimers();
    const result = await promise;

    expect(result.capabilities[0].name).toBe('resize');
    expect(result.capabilities[0].enabled).toBe(true);
    expect(result.plan).toBe('basic');
  });
});
