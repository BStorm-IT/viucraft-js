import { FetchClient } from '../client/FetchClient';
import { UploadResponse, ImageListResponseV2, TransformResponse } from '../types';
import { validateImageId } from '../validation';

export class ImagesResource {
  constructor(private readonly http: FetchClient) {}

  async upload(file: Blob | File, options?: { folder?: string }): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file); // CRITICAL: field name is 'file', not 'image'
    if (options?.folder) formData.append('folder', options.folder);
    return this.http.post<UploadResponse>('/api/v1/cli/images/upload', formData);
  }

  async list(params?: { page?: number; limit?: number; q?: string }): Promise<ImageListResponseV2> {
    return this.http.get<ImageListResponseV2>('/api/v1/cli/images', {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async delete(imageId: string): Promise<void> {
    validateImageId(imageId);
    await this.http.delete(`/api/v1/cli/images/${imageId}`);
  }

  async transform(imageId: string, operations: string, format?: string): Promise<TransformResponse> {
    validateImageId(imageId);
    return this.http.post<TransformResponse>('/api/v1/cli/images/transform', {
      uuid: imageId,
      operations,
      ...(format ? { format } : {}),
    });
  }
}
