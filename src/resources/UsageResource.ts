import { FetchClient } from '../client/FetchClient';
import { UsageCurrent, UsageDaily } from '../types';

export class UsageResource {
  constructor(private readonly http: FetchClient) {}

  async current(): Promise<UsageCurrent> {
    return this.http.get<UsageCurrent>('/api/v1/usage', {
      params: { period: 'current' },
    });
  }

  async daily(params?: { start_date?: string; end_date?: string }): Promise<UsageDaily[]> {
    return this.http.get<UsageDaily[]>('/api/v1/usage', {
      params: {
        period: 'daily',
        ...params,
      } as Record<string, string | number | undefined>,
    });
  }
}
