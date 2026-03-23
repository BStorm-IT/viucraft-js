import { FetchClient } from '../client/FetchClient';
import { Preset, PresetListResponse, PresetCreateOptions } from '../types';

export class PresetsResource {
  constructor(private readonly http: FetchClient) {}

  async list(): Promise<PresetListResponse> {
    return this.http.get<PresetListResponse>('/api/v1/presets');
  }

  async get(name: string): Promise<Preset> {
    return this.http.get<Preset>(`/api/v1/presets/${encodeURIComponent(name)}`);
  }

  async create(name: string, operations: string[], options?: PresetCreateOptions): Promise<Preset> {
    return this.http.post<Preset>('/api/v1/presets', {
      name,
      operations,
      ...(options?.description ? { description: options.description } : {}),
    });
  }

  async delete(name: string): Promise<void> {
    await this.http.delete(`/api/v1/presets/${encodeURIComponent(name)}`);
  }
}
