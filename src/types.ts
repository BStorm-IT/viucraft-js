// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

// Rate limit information extracted from response headers
export interface RateLimitInfo {
  limit?: number;
  remaining?: number;
  reset?: number;
}

// Client configuration interface
export interface ViucraftClientConfig {
  apiKey: string;
  subdomain?: string;
  baseUrl?: string;
  accountId?: string; // Required for free plans using the shared API endpoint
  timeout?: number; // Request timeout in milliseconds (default: 30000)
  retry?: RetryConfig | false; // Retry configuration, or false to disable
  enforceHttps?: boolean; // Suppress HTTPS warning when set to false
}

// API response interfaces
export interface UploadResponse {
  status: 'success' | 'error';
  image_id?: string;
  error_message?: string;
}

// Image processing interfaces
export interface ResizeParams {
  width: number;
  height: number;
  scale?: number;
}

export interface CropParams {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface RotateParams {
  angle: number;
  background?: string; // Hex color code
}

export interface BrightnessParams {
  factor: number; // 0.0 to 2.0, default 1.0
}

export interface ContrastParams {
  factor: number; // 0.0 to 2.0, default 1.0
}

export interface BlurParams {
  sigma: number; // Blur radius, default 1.0
}

export interface SharpenParams {
  sigma: number; // Sharpening radius, default 1.0
}

export interface MedianParams {
  size: number; // Size of median filter, default 3
}

export interface ThumbnailParams {
  width: number;
  height: number;
  crop?: 'centre' | 'entropy' | 'attention'; // Optional crop strategy
}

export interface SmartCropParams {
  width: number;
  height: number;
}

export interface FlipParams {
  direction: 'horizontal' | 'vertical' | 'h' | 'v';
}

// --- New operation param interfaces (v2.0) ---

export interface GammaParams {
  value: number; // 0.1-10.0, default 2.2
}

export interface TintParams {
  highlight?: string; // hex6 color
  shadow?: string;    // hex6 color
}

export interface ColorizeParams {
  color: string;     // hex6 (required)
  amount?: number;   // 0-1
}

export interface VignetteParams {
  scale?: number;    // 0-1
  opacity?: number;  // 0-1
  color?: string;    // hex6
}

export interface PixelateParams {
  size?: number; // 2-100, default 10
}

export interface NoiseParams {
  type?: 'gaussian' | 'salt' | 'pepper' | 'salt-pepper';
  amount?: number; // 0-1
}

export interface AutoEnhanceParams {
  strength?: number; // 0-1, default 0.5
}

export interface BorderParams {
  width?: number;        // 1-200
  color?: string;        // hex6
  radius?: number;       // 0-500
  shadowBlur?: number;   // 0-50
  shadowColor?: string;  // hex6
  shadowX?: number;
  shadowY?: number;
}

export type WatermarkPosition =
  | 'top-left' | 'tc' | 'top-right'
  | 'ml' | 'mc' | 'mr'
  | 'bottom-left' | 'bc' | 'bottom-right';

export interface WatermarkTextParams {
  text: string;
  opacity?: number;    // 0-1
  position?: WatermarkPosition;
  x?: number;
  y?: number;
  rotation?: number;   // 0-360
  size?: number;       // 8-200
  color?: string;      // hex6
  font?: string;
}

export interface WatermarkImageParams {
  image: string;       // imageId
  opacity?: number;    // 0-1
  position?: WatermarkPosition;
  x?: number;
  y?: number;
  rotation?: number;   // 0-360
  size?: number;       // 8-200
}

export type WatermarkParams = WatermarkTextParams | WatermarkImageParams;

export interface TiledWatermarkParams {
  text: string;         // required
  size?: number;        // 8-200
  color?: string;       // hex6
  opacity?: number;     // 0-100
  spacing?: number;     // >= 0
  rotation?: number;
}

export interface CompositeParams {
  image: string;       // imageId (required)
  mode?: 'over' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'colour-dodge' | 'colour-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion';
  x?: number;
  y?: number;
}

export interface SvgOverlayParams {
  data: string;        // base64 or URL-encoded SVG (required)
  x?: number;
  y?: number;
  scale?: number;      // 0.1-5.0
  opacity?: number;    // 0-100
}

export interface PaletteParams {
  count?: number;      // 3-10, default 5
  width?: number;
  height?: number;
}

export interface PlaceholderParams {
  size?: number;       // 8-128, default 32
}

export interface ResponsiveParams {
  widths: number[];    // array of pixel widths
  format?: OutputFormat;
}

// Output format
export type OutputFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'tiff';

// Processing instructions interface
export interface ProcessingInstructions {
  // Existing 15
  resize?: ResizeParams;
  crop?: CropParams;
  rotate?: RotateParams;
  brightness?: BrightnessParams | number;
  contrast?: ContrastParams | number;
  grayscale?: boolean;
  invert?: boolean;
  blur?: BlurParams | number;
  sharpen?: SharpenParams | number;
  emboss?: boolean;
  median?: MedianParams | number;
  thumbnail?: ThumbnailParams;
  smartcrop?: SmartCropParams;
  flip?: FlipParams;
  quality?: number;
  // New 17
  gamma?: GammaParams | number;
  tint?: TintParams;
  colorize?: ColorizeParams;
  vignette?: VignetteParams;
  pixelate?: PixelateParams | number;
  noise?: NoiseParams;
  edge?: boolean;
  autoEnhance?: AutoEnhanceParams | number;
  border?: BorderParams;
  watermark?: WatermarkParams;
  tiledWatermark?: TiledWatermarkParams;
  composite?: CompositeParams;
  svgOverlay?: SvgOverlayParams;
  palette?: PaletteParams | number;
  metadataStrip?: boolean;
  placeholder?: PlaceholderParams | number;
  responsive?: ResponsiveParams;
}

// Typed response for getImageInfo()
export interface ImageInfo {
  id: string;
  filename?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

// Typed response for listImages()
export interface ImageListResponse {
  images: ImageInfo[];
  total: number;
  page: number;
  limit: number;
}

// Typed response for deleteImage()
export interface DeleteResponse {
  success: boolean;
  message?: string;
}

// --- Resource response types (v2.0) ---

export interface PaginationMeta {
  limit: number;
  page: number;
  total: number;
}

export interface ImageListResponseV2 {
  images: ImageInfo[];
  pagination: PaginationMeta;
}

export interface TransformResponse {
  url: string;
  cached: boolean;
}

// Batch
export interface BatchTask {
  image_id: string;
  operations: string;
  format?: string;
}

export interface BatchJob {
  id: string;
  name?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'completed_with_errors';
  tasks_total: number;
  tasks_completed: number;
  tasks_failed: number;
  created_at: string;
  updated_at: string;
}

export interface BatchJobListResponse {
  jobs: BatchJob[];
  pagination: PaginationMeta;
}

export interface BatchJobDetailResponse extends BatchJob {
  tasks: BatchTaskResult[];
  pagination?: PaginationMeta;
}

export interface BatchTaskResult {
  image_id: string;
  status: 'pending' | 'completed' | 'failed';
  output_url?: string;
  error?: string;
}

export interface BatchCreateOptions {
  name?: string;
  webhook_url?: string;
  notify_on?: string;
  priority?: number;
  idempotencyKey?: string;
}

// Webhooks
export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  description?: string;
  created_at: string;
}

export interface WebhookListResponse {
  endpoints: WebhookEndpoint[];
  limit: number;
}

export interface WebhookTestResponse {
  success: boolean;
  statusCode: number;
  responseTime: number;
  error?: string;
}

// Presets
export interface Preset {
  name: string;
  operations: string[];
  type: 'built-in' | 'custom';
}

export interface PresetListResponse {
  presets: Preset[];
}

export interface PresetCreateOptions {
  description?: string;
}

// Warm Sets
export interface WarmSet {
  id: string;
  name: string;
  operations: string;
  format: string;
  created_at: string;
}

export interface WarmSetListResponse {
  warm_sets: WarmSet[];
}

export interface WarmSetCreateOptions {
  format?: 'jpeg' | 'webp' | 'png' | 'gif' | 'both' | 'original';
}

// Analytics
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  has_alpha: boolean;
  color_space: string;
}

export interface ColorInfo {
  hex: string;
  percentage: number;
  name?: string;
}

export interface QualityAssessment {
  score: number;
  details: Record<string, unknown>;
}

export interface FormatRecommendation {
  format: string;
  estimated_size: number;
  quality_score: number;
}

export interface BreakpointResult {
  widths: number[];
  format: string;
}

// Usage
export interface UsageCurrent {
  requests: { used: number; limit: number; percentage: number };
  storage: { used: number; limit: number; percentage: number };
  bandwidth: { used: number; limit: number; percentage: number };
}

export interface UsageDaily {
  date: string;
  requests: number;
  bandwidth: number;
  storage: number;
}

// Discovery
export interface Capability {
  name: string;
  enabled: boolean;
  limit?: number | string;
}

export interface CapabilitiesResponse {
  capabilities: Capability[];
  plan: string;
}

// FetchClient internal config (used by resources)
export interface ResolvedClientConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retry: RetryConfig | false;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  body?: BodyInit;
  params?: Record<string, string | number | undefined>;
}
