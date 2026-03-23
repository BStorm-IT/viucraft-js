import { FetchClient } from '../client/FetchClient';
import {
  BatchTask,
  BatchJob,
  BatchJobListResponse,
  BatchJobDetailResponse,
  BatchCreateOptions,
} from '../types';

export class BatchResource {
  constructor(private readonly http: FetchClient) {}

  async create(tasks: BatchTask[], options?: BatchCreateOptions): Promise<BatchJob> {
    const body: Record<string, unknown> = { tasks };
    if (options?.name) body.name = options.name;
    if (options?.webhook_url) body.webhook_url = options.webhook_url;
    if (options?.notify_on) body.notify_on = options.notify_on;
    if (options?.priority !== undefined) body.priority = options.priority;

    const headers: Record<string, string> = {};
    if (options?.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    return this.http.post<BatchJob>('/api/v1/jobs', body, { headers });
  }

  async list(params?: { page?: number; per_page?: number }): Promise<BatchJobListResponse> {
    return this.http.get<BatchJobListResponse>('/api/v1/jobs', {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async get(
    jobId: string,
    params?: { page?: number; per_page?: number; status?: string }
  ): Promise<BatchJobDetailResponse> {
    return this.http.get<BatchJobDetailResponse>(`/api/v1/jobs/${jobId}`, {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async results(jobId: string): Promise<unknown[]> {
    return this.http.get<unknown[]>(`/api/v1/jobs/${jobId}/results.json`);
  }

  async cancel(jobId: string): Promise<BatchJob> {
    return this.http.post<BatchJob>(`/api/v1/jobs/${jobId}/cancel`);
  }

  async retry(jobId: string): Promise<BatchJob> {
    return this.http.post<BatchJob>(`/api/v1/jobs/${jobId}/retry`);
  }

  async download(jobId: string): Promise<Blob> {
    return this.http.get<Blob>(`/api/v1/jobs/${jobId}/download`);
  }
}
