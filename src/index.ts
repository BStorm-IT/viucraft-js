// Public API surface for the viucraft SDK

// Main client
export { ViucraftClient } from './client/ViucraftClient';

// Standalone URL builder (tree-shakeable — no fetch bundled)
export { ImageBuilder } from './builder/ImageBuilder';

// Error classes
export {
  ViucraftError,
  ViucraftValidationError,
  ViucraftRateLimitError,
  ViucraftNetworkError,
  ViucraftTimeoutError,
} from './errors';

// Resource classes (for advanced typing)
export { ImagesResource } from './resources/ImagesResource';
export { BatchResource } from './resources/BatchResource';
export { WebhooksResource } from './resources/WebhooksResource';
export { PresetsResource } from './resources/PresetsResource';
export { WarmSetsResource } from './resources/WarmSetsResource';
export { AnalyticsResource } from './resources/AnalyticsResource';
export { UsageResource } from './resources/UsageResource';
export { DiscoveryResource } from './resources/DiscoveryResource';

// Type exports
export type {
  // Client config
  ViucraftClientConfig,
  RetryConfig,
  RateLimitInfo,

  // Image operations
  ProcessingInstructions,
  OutputFormat,
  ResizeParams,
  CropParams,
  RotateParams,
  BrightnessParams,
  ContrastParams,
  BlurParams,
  SharpenParams,
  MedianParams,
  ThumbnailParams,
  SmartCropParams,
  FlipParams,
  GammaParams,
  TintParams,
  ColorizeParams,
  VignetteParams,
  PixelateParams,
  NoiseParams,
  AutoEnhanceParams,
  BorderParams,
  WatermarkTextParams,
  WatermarkImageParams,
  WatermarkParams,
  WatermarkPosition,
  TiledWatermarkParams,
  CompositeParams,
  SvgOverlayParams,
  PaletteParams,
  PlaceholderParams,
  ResponsiveParams,

  // API responses
  UploadResponse,
  ImageInfo,
  ImageListResponse,
  ImageListResponseV2,
  DeleteResponse,
  TransformResponse,
  PaginationMeta,

  // Batch
  BatchTask,
  BatchJob,
  BatchJobListResponse,
  BatchJobDetailResponse,
  BatchTaskResult,
  BatchCreateOptions,

  // Webhooks
  WebhookEndpoint,
  WebhookListResponse,
  WebhookTestResponse,

  // Presets
  Preset,
  PresetListResponse,
  PresetCreateOptions,

  // Warm Sets
  WarmSet,
  WarmSetListResponse,
  WarmSetCreateOptions,

  // Analytics
  ImageMetadata,
  ColorInfo,
  QualityAssessment,
  FormatRecommendation,
  BreakpointResult,

  // Usage
  UsageCurrent,
  UsageDaily,

  // Discovery
  Capability,
  CapabilitiesResponse,
} from './types';
