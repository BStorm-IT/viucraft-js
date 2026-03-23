import {
  ProcessingInstructions,
  OutputFormat,
  WatermarkTextParams,
  WatermarkImageParams,
  TiledWatermarkParams,
  CompositeParams,
} from '../types';
import { formatProcessingInstructions, formatShortInstructions } from '../utils';
import {
  validatePositiveInteger,
  validateNonNegativeInteger,
  validateRange,
  validatePositiveNumber,
  validateHexColor,
  validateHex6Color,
  validateIntegerRange,
  validateNonNegativeNumber,
  validateNonEmptyString,
  validateOneOf,
  VALID_NOISE_TYPES,
  VALID_WATERMARK_POSITIONS,
  VALID_COMPOSITE_MODES,
  MAX_DIMENSION,
  MAX_BLUR_SIGMA,
  MAX_MEDIAN_SIZE,
} from '../validation';
import { ViucraftValidationError } from '../errors';

/**
 * Configuration for the ImageBuilder
 */
interface ImageBuilderConfig {
  subdomain?: string;
  baseUrl: string;
  accountId?: string;
}

/**
 * Builder class for creating image transformation URLs with a chainable API
 */
export class ImageBuilder {
  private imageId: string;
  private config: ImageBuilderConfig;
  private instructions: ProcessingInstructions;
  private format: OutputFormat;
  private useShortFormat: boolean;

  /**
   * Create a new ImageBuilder
   * @param imageId UUID of the image
   * @param config Configuration for the builder
   */
  constructor(imageId: string, config: ImageBuilderConfig) {
    this.imageId = imageId;
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://api.viucraft.com'
    };
    this.instructions = {};
    this.format = 'jpg';
    this.useShortFormat = false;
  }

  /**
   * Set the output format of the image
   * @param format Output format (jpg, jpeg, png, webp, avif, gif, tiff)
   * @returns The builder instance for chaining
   */
  public setFormat(format: OutputFormat): ImageBuilder {
    const validFormats: OutputFormat[] = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'tiff'];
    if (!validFormats.includes(format)) {
      throw new ViucraftValidationError(
        `format must be one of ${validFormats.join(', ')}, got "${format}"`,
        'format'
      );
    }
    this.format = format;
    return this;
  }

  /**
   * Use the short format for the URL
   * @param useShort Whether to use the short format (default: true)
   * @returns The builder instance for chaining
   */
  public useShort(useShort: boolean = true): ImageBuilder {
    this.useShortFormat = useShort;
    return this;
  }

  /**
   * Resize the image
   * @param width Width in pixels
   * @param height Height in pixels
   * @param scale Optional scale factor
   * @returns The builder instance for chaining
   */
  public resize(width: number, height: number, scale?: number): ImageBuilder {
    validatePositiveInteger('width', width);
    validatePositiveInteger('height', height);
    validateRange('width', width, 1, MAX_DIMENSION);
    validateRange('height', height, 1, MAX_DIMENSION);
    if (scale !== undefined) {
      validatePositiveNumber('scale', scale);
    }
    this.instructions.resize = { width, height, scale };
    return this;
  }

  /**
   * Crop the image
   * @param left Left position in pixels
   * @param top Top position in pixels
   * @param width Width in pixels
   * @param height Height in pixels
   * @returns The builder instance for chaining
   */
  public crop(left: number, top: number, width: number, height: number): ImageBuilder {
    validateNonNegativeInteger('left', left);
    validateNonNegativeInteger('top', top);
    validatePositiveInteger('width', width);
    validatePositiveInteger('height', height);
    validateRange('width', width, 1, MAX_DIMENSION);
    validateRange('height', height, height, MAX_DIMENSION);
    this.instructions.crop = { left, top, width, height };
    return this;
  }

  /**
   * Rotate the image
   * @param angle Rotation angle in degrees
   * @param background Optional background color as hex code (e.g. "#ff0000")
   * @returns The builder instance for chaining
   */
  public rotate(angle: number, background?: string): ImageBuilder {
    if (typeof angle !== 'number' || !isFinite(angle)) {
      throw new ViucraftValidationError(
        `angle must be a finite number, got ${angle}`,
        'angle'
      );
    }
    if (background !== undefined) {
      validateHexColor('background', background);
    }
    this.instructions.rotate = { angle, background };
    return this;
  }

  /**
   * Adjust the brightness of the image
   * @param factor Brightness factor (0 to 10)
   * @returns The builder instance for chaining
   */
  public brightness(factor: number): ImageBuilder {
    validateRange('brightness', factor, 0, 10);
    this.instructions.brightness = factor;
    return this;
  }

  /**
   * Adjust the contrast of the image
   * @param factor Contrast factor (0 to 10)
   * @returns The builder instance for chaining
   */
  public contrast(factor: number): ImageBuilder {
    validateRange('contrast', factor, 0, 10);
    this.instructions.contrast = factor;
    return this;
  }

  /**
   * Convert the image to grayscale
   * @returns The builder instance for chaining
   */
  public grayscale(): ImageBuilder {
    this.instructions.grayscale = true;
    return this;
  }

  /**
   * Invert the image colors
   * @returns The builder instance for chaining
   */
  public invert(): ImageBuilder {
    this.instructions.invert = true;
    return this;
  }

  /**
   * Apply a blur effect to the image
   * @param sigma Blur radius (default 1.0)
   * @returns The builder instance for chaining
   */
  public blur(sigma: number = 1.0): ImageBuilder {
    validatePositiveNumber('sigma', sigma);
    validateRange('sigma', sigma, 0.01, MAX_BLUR_SIGMA);
    this.instructions.blur = sigma;
    return this;
  }

  /**
   * Sharpen the image
   * @param sigma Sharpening radius (default 1.0)
   * @returns The builder instance for chaining
   */
  public sharpen(sigma: number = 1.0): ImageBuilder {
    validatePositiveNumber('sigma', sigma);
    validateRange('sigma', sigma, 0.01, MAX_BLUR_SIGMA);
    this.instructions.sharpen = sigma;
    return this;
  }

  /**
   * Apply an emboss effect to the image
   * @returns The builder instance for chaining
   */
  public emboss(): ImageBuilder {
    this.instructions.emboss = true;
    return this;
  }

  /**
   * Apply a median filter to the image
   * @param size Size of median filter (must be positive odd integer, default 3)
   * @returns The builder instance for chaining
   */
  public median(size: number = 3): ImageBuilder {
    validatePositiveInteger('size', size);
    if (size % 2 === 0) {
      throw new ViucraftValidationError(
        `size must be an odd integer, got ${size}`,
        'size'
      );
    }
    validateRange('size', size, 1, MAX_MEDIAN_SIZE);
    this.instructions.median = size;
    return this;
  }

  /**
   * Create a thumbnail with optional crop strategy
   * @param width Width in pixels
   * @param height Height in pixels
   * @param crop Optional crop strategy ('centre', 'entropy', 'attention')
   * @returns The builder instance for chaining
   */
  public thumbnail(
    width: number,
    height: number,
    crop?: 'centre' | 'entropy' | 'attention'
  ): ImageBuilder {
    validatePositiveInteger('width', width);
    validatePositiveInteger('height', height);
    validateRange('width', width, 1, MAX_DIMENSION);
    validateRange('height', height, 1, MAX_DIMENSION);
    this.instructions.thumbnail = { width, height, crop };
    return this;
  }

  /**
   * Apply smart cropping
   * @param width Width in pixels
   * @param height Height in pixels
   * @returns The builder instance for chaining
   */
  public smartCrop(width: number, height: number): ImageBuilder {
    validatePositiveInteger('width', width);
    validatePositiveInteger('height', height);
    validateRange('width', width, 1, MAX_DIMENSION);
    validateRange('height', height, 1, MAX_DIMENSION);
    this.instructions.smartcrop = { width, height };
    return this;
  }

  /**
   * Flip the image horizontally or vertically
   * @param direction Flip direction ('horizontal', 'vertical', 'h', or 'v')
   * @returns The builder instance for chaining
   */
  public flip(direction: 'horizontal' | 'vertical' | 'h' | 'v'): ImageBuilder {
    const validDirections = ['horizontal', 'vertical', 'h', 'v'];
    if (!validDirections.includes(direction)) {
      throw new ViucraftValidationError(
        `direction must be one of ${validDirections.join(', ')}, got "${direction}"`,
        'direction'
      );
    }
    this.instructions.flip = { direction };
    return this;
  }

  /**
   * Set the output quality (1-100)
   * @param value Quality value from 1 to 100
   * @returns The builder instance for chaining
   */
  public quality(value: number): ImageBuilder {
    validateRange('quality', value, 1, 100);
    this.instructions.quality = value;
    return this;
  }

  // --- 17 new operations (v2.0) ---

  /**
   * Apply gamma correction
   * @param value Gamma value (0.1 to 10.0, default 2.2)
   */
  public gamma(value: number = 2.2): ImageBuilder {
    validateRange('gamma', value, 0.1, 10.0);
    this.instructions.gamma = value;
    return this;
  }

  /**
   * Apply a color tint to highlights and/or shadows
   * @param highlight Optional hex6 highlight color
   * @param shadow Optional hex6 shadow color
   */
  public tint(highlight?: string, shadow?: string): ImageBuilder {
    if (highlight !== undefined) validateHex6Color('highlight', highlight);
    if (shadow !== undefined) validateHex6Color('shadow', shadow);
    this.instructions.tint = {
      highlight: highlight?.replace('#', ''),
      shadow: shadow?.replace('#', ''),
    };
    return this;
  }

  /**
   * Colorize the image with a specific color
   * @param color Required hex6 color
   * @param amount Optional blend amount (0 to 1)
   */
  public colorize(color: string, amount?: number): ImageBuilder {
    validateHex6Color('color', color);
    if (amount !== undefined) validateRange('amount', amount, 0, 1);
    this.instructions.colorize = { color: color.replace('#', ''), amount };
    return this;
  }

  /**
   * Apply a vignette effect
   * @param scale Optional scale (0 to 1)
   * @param opacity Optional opacity (0 to 1)
   * @param color Optional hex6 color
   */
  public vignette(scale?: number, opacity?: number, color?: string): ImageBuilder {
    if (scale !== undefined) validateRange('scale', scale, 0, 1);
    if (opacity !== undefined) validateRange('opacity', opacity, 0, 1);
    if (color !== undefined) validateHex6Color('color', color);
    this.instructions.vignette = {
      scale,
      opacity,
      color: color?.replace('#', ''),
    };
    return this;
  }

  /**
   * Pixelate the image
   * @param size Pixel block size (2 to 100, default 10)
   */
  public pixelate(size: number = 10): ImageBuilder {
    validateIntegerRange('size', size, 2, 100);
    this.instructions.pixelate = size;
    return this;
  }

  /**
   * Add noise to the image
   * @param type Optional noise type ('gaussian', 'salt', 'pepper', 'salt-pepper')
   * @param amount Optional amount (0 to 1)
   */
  public noise(type?: 'gaussian' | 'salt' | 'pepper' | 'salt-pepper', amount?: number): ImageBuilder {
    if (type !== undefined) validateOneOf('type', type, VALID_NOISE_TYPES as unknown as readonly typeof type[]);
    if (amount !== undefined) validateRange('amount', amount, 0, 1);
    this.instructions.noise = { type, amount };
    return this;
  }

  /**
   * Apply edge detection
   */
  public edge(): ImageBuilder {
    this.instructions.edge = true;
    return this;
  }

  /**
   * Apply automatic enhancement
   * @param strength Enhancement strength (0 to 1, default 0.5)
   */
  public autoEnhance(strength: number = 0.5): ImageBuilder {
    validateRange('strength', strength, 0, 1);
    this.instructions.autoEnhance = strength;
    return this;
  }

  /**
   * Add a border to the image
   * @param opts Border options
   */
  public border(opts?: {
    width?: number;
    color?: string;
    radius?: number;
    shadowBlur?: number;
    shadowColor?: string;
    shadowX?: number;
    shadowY?: number;
  }): ImageBuilder {
    if (opts?.width !== undefined) validateIntegerRange('width', opts.width, 1, 200);
    if (opts?.color !== undefined) validateHex6Color('color', opts.color);
    if (opts?.radius !== undefined) validateRange('radius', opts.radius, 0, 500);
    if (opts?.shadowBlur !== undefined) validateRange('shadowBlur', opts.shadowBlur, 0, 50);
    if (opts?.shadowColor !== undefined) validateHex6Color('shadowColor', opts.shadowColor);
    this.instructions.border = {
      width: opts?.width,
      color: opts?.color?.replace('#', ''),
      radius: opts?.radius,
      shadowBlur: opts?.shadowBlur,
      shadowColor: opts?.shadowColor?.replace('#', ''),
      shadowX: opts?.shadowX,
      shadowY: opts?.shadowY,
    };
    return this;
  }

  /**
   * Add a watermark (text or image)
   * @param opts Watermark options (must have either text or image property)
   */
  public watermark(opts: WatermarkTextParams | WatermarkImageParams): ImageBuilder {
    if ('text' in opts) {
      validateNonEmptyString('text', opts.text);
    } else {
      validateNonEmptyString('image', opts.image);
    }
    if (opts.opacity !== undefined) validateRange('opacity', opts.opacity, 0, 1);
    if (opts.position !== undefined) validateOneOf('position', opts.position, VALID_WATERMARK_POSITIONS as unknown as readonly typeof opts.position[]);
    if (opts.rotation !== undefined) validateRange('rotation', opts.rotation, 0, 360);
    if (opts.size !== undefined) validateIntegerRange('size', opts.size, 8, 200);
    if ('color' in opts && opts.color !== undefined) validateHex6Color('color', opts.color);
    this.instructions.watermark = opts;
    return this;
  }

  /**
   * Add a tiled watermark text
   * @param text Watermark text
   * @param opts Optional tiled watermark options
   */
  public tiledWatermark(text: string, opts?: Omit<TiledWatermarkParams, 'text'>): ImageBuilder {
    validateNonEmptyString('text', text);
    if (opts?.size !== undefined) validateIntegerRange('size', opts.size, 8, 200);
    if (opts?.color !== undefined) validateHex6Color('color', opts.color);
    if (opts?.opacity !== undefined) validateRange('opacity', opts.opacity, 0, 100);
    if (opts?.spacing !== undefined) validateNonNegativeNumber('spacing', opts.spacing);
    this.instructions.tiledWatermark = { text, ...opts };
    return this;
  }

  /**
   * Composite another image on top
   * @param imageId ID of the overlay image
   * @param opts Optional composite options
   */
  public composite(imageId: string, opts?: { mode?: CompositeParams['mode']; x?: number; y?: number }): ImageBuilder {
    validateNonEmptyString('imageId', imageId);
    if (opts?.mode !== undefined) validateOneOf('mode', opts.mode, VALID_COMPOSITE_MODES as unknown as readonly typeof opts.mode[]);
    this.instructions.composite = { image: imageId, ...opts };
    return this;
  }

  /**
   * Overlay an SVG
   * @param data SVG data (base64 or URL-encoded)
   * @param opts Optional overlay options
   */
  public svgOverlay(data: string, opts?: { x?: number; y?: number; scale?: number; opacity?: number }): ImageBuilder {
    validateNonEmptyString('data', data);
    if (opts?.scale !== undefined) validateRange('scale', opts.scale, 0.1, 5.0);
    if (opts?.opacity !== undefined) validateRange('opacity', opts.opacity, 0, 100);
    this.instructions.svgOverlay = { data, ...opts };
    return this;
  }

  /**
   * Extract a color palette from the image
   * @param count Number of colors (3 to 10, default 5)
   * @param width Optional output width
   * @param height Optional output height
   */
  public palette(count: number = 5, width?: number, height?: number): ImageBuilder {
    validateIntegerRange('count', count, 3, 10);
    if (width !== undefined) validatePositiveInteger('width', width);
    if (height !== undefined) validatePositiveInteger('height', height);
    this.instructions.palette = { count, width, height };
    return this;
  }

  /**
   * Strip all metadata from the image
   */
  public metadataStrip(): ImageBuilder {
    this.instructions.metadataStrip = true;
    return this;
  }

  /**
   * Generate a low-quality image placeholder
   * @param size Placeholder size (8 to 128, default 32)
   */
  public placeholder(size: number = 32): ImageBuilder {
    validateIntegerRange('size', size, 8, 128);
    this.instructions.placeholder = size;
    return this;
  }

  /**
   * Generate responsive image srcset widths
   * @param widths Array of pixel widths
   * @param format Optional output format
   */
  public responsive(widths: number[], format?: OutputFormat): ImageBuilder {
    if (!Array.isArray(widths) || widths.length === 0) {
      throw new ViucraftValidationError('widths must be a non-empty array of numbers', 'widths');
    }
    widths.forEach((w, i) => validatePositiveInteger(`widths[${i}]`, w));
    this.instructions.responsive = { widths, format };
    return this;
  }

  /**
   * Get a copy of the current processing instructions
   * @returns A copy of the current instructions object
   */
  public getInstructions(): ProcessingInstructions {
    return { ...this.instructions };
  }

  /**
   * Build the final URL with all the applied transformations
   * @returns The URL for the processed image
   */
  public toURL(): string {
    // If subdomain is provided, use it for the URL
    const baseUrl = this.config.subdomain
      ? `https://${this.config.subdomain}.viucraft.com`
      : this.config.baseUrl;

    // Format the instructions based on the desired output format
    const formattedInstructions = this.useShortFormat
      ? formatShortInstructions(this.instructions)
      : formatProcessingInstructions(this.instructions);

    // For free plans, add the account ID to the URL
    if (!this.config.subdomain && this.config.accountId) {
      return `${baseUrl}/free/${this.config.accountId}/${formattedInstructions}/${this.imageId}.${this.format}`;
    }

    return `${baseUrl}/${formattedInstructions}/${this.imageId}.${this.format}`;
  }

  /**
   * Get the URL string representation
   * @returns The URL string
   */
  public toString(): string {
    return this.toURL();
  }
}
