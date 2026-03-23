import { FetchClient } from '../client/FetchClient';
import { CapabilitiesResponse } from '../types';

export class DiscoveryResource {
  constructor(private readonly http: FetchClient) {}

  async capabilities(): Promise<CapabilitiesResponse> {
    return this.http.get<CapabilitiesResponse>('/api/capabilities');
  }
}
