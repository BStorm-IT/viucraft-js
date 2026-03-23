import { FetchClient } from '../client/FetchClient';
import {
  ImageMetadata,
  ColorInfo,
  QualityAssessment,
  FormatRecommendation,
  BreakpointResult,
} from '../types';
import { validateImageId } from '../validation';

export class AnalyticsResource {
  constructor(private readonly http: FetchClient) {}

  async metadata(imageId: string): Promise<ImageMetadata> {
    validateImageId(imageId);
    return this.http.get<ImageMetadata>(`/api/v1/images/${imageId}/metadata`);
  }

  async colors(imageId: string, count?: number): Promise<ColorInfo[]> {
    validateImageId(imageId);
    return this.http.get<ColorInfo[]>(`/api/v1/images/${imageId}/colors`, {
      params: count !== undefined ? { count } : undefined,
    });
  }

  async quality(imageId: string): Promise<QualityAssessment> {
    validateImageId(imageId);
    return this.http.get<QualityAssessment>(`/api/v1/images/${imageId}/quality`);
  }

  async recommend(imageId: string): Promise<FormatRecommendation[]> {
    validateImageId(imageId);
    return this.http.get<FormatRecommendation[]>(`/api/v1/images/${imageId}/recommend`);
  }

  async breakpoints(imageId: string, format?: string): Promise<BreakpointResult> {
    validateImageId(imageId);
    return this.http.get<BreakpointResult>(`/api/v1/images/${imageId}/breakpoints`, {
      params: format ? { format } : undefined,
    });
  }
}
