import {
  ViucraftClientConfig,
  ResolvedClientConfig,
  RetryConfig,
  UploadResponse,
  ImageListResponse,
  DeleteResponse,
  AccountConfigResponse,
} from '../types';
import { FetchClient } from './FetchClient';
import { ImageBuilder } from '../builder/ImageBuilder';
import { ImagesResource } from '../resources/ImagesResource';
import { BatchResource } from '../resources/BatchResource';
import { WebhooksResource } from '../resources/WebhooksResource';
import { PresetsResource } from '../resources/PresetsResource';
import { WarmSetsResource } from '../resources/WarmSetsResource';
import { AnalyticsResource } from '../resources/AnalyticsResource';
import { UsageResource } from '../resources/UsageResource';
import { DiscoveryResource } from '../resources/DiscoveryResource';
import { validateApiKey } from '../validation';

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

/**
 * Main client for interacting with the Viucraft API.
 *
 * @example
 * ```typescript
 * const client = new ViucraftClient({ apiKey: 'your-key', subdomain: 'myapp' });
 *
 * // URL builder (standalone, no API call)
 * const url = client.image('uuid').resize(800, 600).blur(5).toURL();
 *
 * // API operations (namespaced)
 * const uploaded = await client.images.upload(file);
 * const job = await client.batch.create([{ image_id: 'uuid', operations: 'resize_width_800' }]);
 * const usage = await client.usage.current();
 * ```
 */
export class ViucraftClient {
  private readonly apiKey: string;
  // Mutable so the client can self-heal after a plan change via resolveEndpoint()/updateConfig().
  // image() reads these at call time, so updates take effect on the next URL built.
  private subdomain?: string;
  private baseUrl: string;
  private accountId?: string;
  private http: FetchClient;

  /** Image CRUD operations */
  public readonly images: ImagesResource;
  /** Batch job management */
  public readonly batch: BatchResource;
  /** Webhook endpoint management */
  public readonly webhooks: WebhooksResource;
  /** Preset management */
  public readonly presets: PresetsResource;
  /** Warm set management */
  public readonly warmSets: WarmSetsResource;
  /** Image analytics */
  public readonly analytics: AnalyticsResource;
  /** Usage statistics */
  public readonly usage: UsageResource;
  /** API capability discovery */
  public readonly discovery: DiscoveryResource;

  constructor(config: ViucraftClientConfig) {
    validateApiKey(config.apiKey);

    this.apiKey = config.apiKey;
    this.subdomain = config.subdomain;
    this.accountId = config.accountId;
    this.baseUrl = config.baseUrl || 'https://api.viucraft.com';

    // Warn if using HTTP
    if (this.baseUrl.startsWith('http://') && config.enforceHttps !== false) {
      console.warn(
        '[viucraft] WARNING: Using HTTP instead of HTTPS. ' +
        'API keys sent over HTTP can be intercepted. ' +
        'Set enforceHttps: false to suppress this warning.'
      );
    }

    const resolvedConfig: ResolvedClientConfig = {
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      retry: config.retry === false ? false : {
        ...DEFAULT_RETRY_CONFIG,
        ...(config.retry || {}),
      },
    };

    this.http = new FetchClient(resolvedConfig);

    // Mount resource modules
    this.images = new ImagesResource(this.http);
    this.batch = new BatchResource(this.http);
    this.webhooks = new WebhooksResource(this.http);
    this.presets = new PresetsResource(this.http);
    this.warmSets = new WarmSetsResource(this.http);
    this.analytics = new AnalyticsResource(this.http);
    this.usage = new UsageResource(this.http);
    this.discovery = new DiscoveryResource(this.http);
  }

  /**
   * Create an ImageBuilder for building URLs with chained transformations.
   * The ImageBuilder is standalone — it does NOT make API calls.
   * @param imageId UUID of the image
   * @returns An ImageBuilder instance for chaining transformations
   */
  public image(imageId: string): ImageBuilder {
    return new ImageBuilder(imageId, {
      subdomain: this.subdomain,
      baseUrl: this.baseUrl,
      accountId: this.accountId,
    });
  }

  /**
   * Construct a client and immediately resolve its current endpoint config from the API.
   * Prefer this over `new ViucraftClient(...)` when the account's plan/subdomain may have
   * changed since the credentials were issued — it guarantees the first URL you build uses
   * the correct (possibly downgraded) base.
   */
  public static async create(config: ViucraftClientConfig): Promise<ViucraftClient> {
    const client = new ViucraftClient(config);
    await client.resolveEndpoint();
    return client;
  }

  /**
   * Fetch the account's current canonical URL configuration from `GET /api/v1/account`
   * and apply it, so subsequent `image()` calls target the right base. This is the SDK's
   * self-heal for plan changes: after a paid→free downgrade the server reports
   * `subdomain: null`, and the builder switches from the (now-dead) subdomain URL to the
   * shared `/free/acc_*` URL automatically.
   *
   * @returns The resolved account configuration.
   */
  public async resolveEndpoint(): Promise<AccountConfigResponse> {
    const cfg = await this.http.get<AccountConfigResponse>('/api/v1/account');

    // null subdomain MUST clear a previously-cached subdomain (the downgrade case).
    this.subdomain = cfg.subdomain ?? undefined;
    this.accountId = cfg.account_id ?? undefined;
    if (cfg.base_url) {
      this.baseUrl = cfg.base_url;
    }

    const currentConfig = (this.http as unknown as { config: ResolvedClientConfig }).config;
    this.rebuildHttp({ ...currentConfig, apiKey: this.apiKey, baseUrl: this.baseUrl });

    return cfg;
  }

  /**
   * Update client configuration after construction.
   * @param partial Partial configuration to merge. Pass `subdomain: null` (or '') to clear
   *   a subdomain and fall back to the free-tier URL form.
   */
  public updateConfig(
    partial: Partial<Pick<ViucraftClientConfig, 'apiKey' | 'timeout' | 'baseUrl' | 'accountId'>>
      & { subdomain?: string | null }
  ): void {
    if (partial.apiKey !== undefined) {
      validateApiKey(partial.apiKey);
    }
    if (partial.subdomain !== undefined) {
      this.subdomain = partial.subdomain || undefined;
    }
    if (partial.accountId !== undefined) {
      this.accountId = partial.accountId || undefined;
    }
    if (partial.baseUrl !== undefined) {
      this.baseUrl = partial.baseUrl;
    }

    const currentConfig = (this.http as unknown as { config: ResolvedClientConfig }).config;
    this.rebuildHttp({
      apiKey: partial.apiKey ?? this.apiKey,
      baseUrl: this.baseUrl,
      timeout: partial.timeout ?? currentConfig.timeout,
      retry: currentConfig.retry,
    });
  }

  /**
   * Recreate the HTTP client with a new resolved config and re-mount all resource modules.
   */
  private rebuildHttp(config: ResolvedClientConfig): void {
    this.http = new FetchClient(config);

    (this as { images: ImagesResource }).images = new ImagesResource(this.http);
    (this as { batch: BatchResource }).batch = new BatchResource(this.http);
    (this as { webhooks: WebhooksResource }).webhooks = new WebhooksResource(this.http);
    (this as { presets: PresetsResource }).presets = new PresetsResource(this.http);
    (this as { warmSets: WarmSetsResource }).warmSets = new WarmSetsResource(this.http);
    (this as { analytics: AnalyticsResource }).analytics = new AnalyticsResource(this.http);
    (this as { usage: UsageResource }).usage = new UsageResource(this.http);
    (this as { discovery: DiscoveryResource }).discovery = new DiscoveryResource(this.http);
  }

  /**
   * Returns a masked version of the API key for logging/debugging.
   */
  public getMaskedApiKey(): string {
    if (this.apiKey.length <= 8) {
      return '****';
    }
    return this.apiKey.slice(0, 4) + '****' + this.apiKey.slice(-4);
  }

  // ---- Deprecated convenience methods (v1 backward compat) ----

  /**
   * @deprecated Use `client.images.upload()` instead. Will be removed in v3.0.
   */
  public async uploadImage(
    file: Blob | File,
    metadata?: Record<string, unknown>
  ): Promise<UploadResponse> {
    return this.images.upload(file, metadata ? { folder: metadata.folder as string } : undefined);
  }

  /**
   * @deprecated Use `client.images.delete()` instead. Will be removed in v3.0.
   */
  public async deleteImage(imageId: string): Promise<DeleteResponse> {
    await this.images.delete(imageId);
    return { success: true, message: 'Image deleted successfully' };
  }

  /**
   * @deprecated Use `client.images.list()` instead. Will be removed in v3.0.
   */
  public async listImages(page: number = 1, limit: number = 20): Promise<ImageListResponse> {
    const result = await this.images.list({ page, limit });
    // Map v2 response to v1 shape for backward compat
    return {
      images: result.images,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    };
  }
}
