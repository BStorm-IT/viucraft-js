import { FetchClient } from '../client/FetchClient';
import { WarmSet, WarmSetListResponse, WarmSetCreateOptions } from '../types';

export class WarmSetsResource {
  constructor(private readonly http: FetchClient) {}

  async list(): Promise<WarmSetListResponse> {
    return this.http.get<WarmSetListResponse>('/api/warm-sets');
  }

  async create(name: string, operations: string, options?: WarmSetCreateOptions): Promise<WarmSet> {
    return this.http.post<WarmSet>('/api/warm-sets', {
      name,
      operations,
      ...(options?.format ? { format: options.format } : {}),
    });
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(`/api/warm-sets/${id}`);
  }
}
