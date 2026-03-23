import { FetchClient } from '../client/FetchClient';
import { WebhookEndpoint, WebhookListResponse, WebhookTestResponse } from '../types';

export class WebhooksResource {
  constructor(private readonly http: FetchClient) {}

  async list(): Promise<WebhookListResponse> {
    return this.http.get<WebhookListResponse>('/api/webhooks'); // NOTE: unversioned path
  }

  async create(url: string, events: string[], description?: string): Promise<WebhookEndpoint> {
    return this.http.post<WebhookEndpoint>('/api/webhooks', {
      url,
      events,
      ...(description ? { description } : {}),
    });
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(`/api/webhooks/${id}`);
  }

  async test(id: string): Promise<WebhookTestResponse> {
    return this.http.post<WebhookTestResponse>(`/api/webhooks/${id}/test`);
  }
}
