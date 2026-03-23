import { ImageBuilder } from '../builder/ImageBuilder';
import { ViucraftValidationError } from '../errors';

const defaultConfig = {
  baseUrl: 'https://api.viucraft.com',
};

function builder(imageId = 'test-image-id') {
  return new ImageBuilder(imageId, defaultConfig);
}

describe('ImageBuilder', () => {
  describe('basic URL generation', () => {
    it('should generate a basic URL with no transformations', () => {
      const url = builder().toURL();
      expect(url).toBe('https://api.viucraft.com//test-image-id.jpg');
    });

    it('should use subdomain when provided', () => {
      const b = new ImageBuilder('img1', { subdomain: 'myapp', baseUrl: 'https://api.viucraft.com' });
      const url = b.resize(100, 100).toURL();
      expect(url).toContain('https://myapp.viucraft.com/');
    });

    it('should include account ID for free plans', () => {
      const b = new ImageBuilder('img1', { baseUrl: 'https://viucraft.com', accountId: 'acc_123' });
      const url = b.resize(100, 100).toURL();
      expect(url).toContain('/free/acc_123/');
    });

    it('should support short format', () => {
      const url = builder().useShort().resize(300, 200).toURL();
      expect(url).toContain('resize-300-200');
    });

    it('should support toString()', () => {
      const b = builder().resize(100, 100);
      expect(b.toString()).toBe(b.toURL());
    });
  });

  describe('setFormat', () => {
    it('should accept valid formats', () => {
      expect(() => builder().setFormat('jpg')).not.toThrow();
      expect(() => builder().setFormat('jpeg')).not.toThrow();
      expect(() => builder().setFormat('png')).not.toThrow();
      expect(() => builder().setFormat('webp')).not.toThrow();
    });

    it('should accept avif, gif, and tiff formats', () => {
      expect(() => builder().setFormat('avif')).not.toThrow();
      expect(() => builder().setFormat('gif')).not.toThrow();
      expect(() => builder().setFormat('tiff')).not.toThrow();
    });

    it('should reject invalid formats', () => {
      expect(() => builder().setFormat('bmp' as any)).toThrow(ViucraftValidationError);
    });

    it('should change the output format in the URL', () => {
      const url = builder().setFormat('webp').resize(100, 100).toURL();
      expect(url).toMatch(/\.webp$/);
    });

    it('should include avif in the URL extension', () => {
      const url = builder().setFormat('avif').toURL();
      expect(url).toMatch(/\.avif$/);
    });
  });

  describe('resize', () => {
    it('should generate correct standard format', () => {
      const url = builder().resize(300, 200).toURL();
      expect(url).toContain('resize_width_300_height_200');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().resize(300, 200).toURL();
      expect(url).toContain('resize-300-200');
    });

    it('should support scale parameter', () => {
      const url = builder().resize(300, 200, 2).toURL();
      expect(url).toContain('resize_width_300_height_200_scale_2');
    });

    it('should reject non-positive width', () => {
      expect(() => builder().resize(0, 200)).toThrow(ViucraftValidationError);
      expect(() => builder().resize(-1, 200)).toThrow(ViucraftValidationError);
    });

    it('should reject non-positive height', () => {
      expect(() => builder().resize(300, 0)).toThrow(ViucraftValidationError);
    });

    it('should reject non-integer dimensions', () => {
      expect(() => builder().resize(1.5, 200)).toThrow(ViucraftValidationError);
    });

    it('should reject dimensions exceeding MAX_DIMENSION', () => {
      expect(() => builder().resize(16385, 200)).toThrow(ViucraftValidationError);
    });

    it('should reject non-positive scale', () => {
      expect(() => builder().resize(300, 200, 0)).toThrow(ViucraftValidationError);
      expect(() => builder().resize(300, 200, -1)).toThrow(ViucraftValidationError);
    });
  });

  describe('crop', () => {
    it('should generate correct format', () => {
      const url = builder().crop(10, 20, 100, 50).toURL();
      expect(url).toContain('crop_left_10_top_20_width_100_height_50');
    });

    it('should accept zero offsets', () => {
      expect(() => builder().crop(0, 0, 100, 100)).not.toThrow();
    });

    it('should reject negative offsets', () => {
      expect(() => builder().crop(-1, 0, 100, 100)).toThrow(ViucraftValidationError);
      expect(() => builder().crop(0, -1, 100, 100)).toThrow(ViucraftValidationError);
    });

    it('should reject non-positive dimensions', () => {
      expect(() => builder().crop(0, 0, 0, 100)).toThrow(ViucraftValidationError);
      expect(() => builder().crop(0, 0, 100, 0)).toThrow(ViucraftValidationError);
    });
  });

  describe('rotate', () => {
    it('should generate correct format', () => {
      const url = builder().rotate(90).toURL();
      expect(url).toContain('rotate_angle_90');
    });

    it('should handle background color', () => {
      const url = builder().rotate(45, '#ff0000').toURL();
      expect(url).toContain('rotate_angle_45_background_ff0000');
    });

    it('should reject non-finite angle', () => {
      expect(() => builder().rotate(Infinity)).toThrow(ViucraftValidationError);
      expect(() => builder().rotate(NaN)).toThrow(ViucraftValidationError);
    });

    it('should reject invalid hex color', () => {
      expect(() => builder().rotate(45, 'notacolor')).toThrow(ViucraftValidationError);
    });

    it('should accept valid hex colors', () => {
      expect(() => builder().rotate(45, '#fff')).not.toThrow();
      expect(() => builder().rotate(45, 'aabbcc')).not.toThrow();
    });
  });

  describe('brightness', () => {
    it('should accept valid range', () => {
      expect(() => builder().brightness(0)).not.toThrow();
      expect(() => builder().brightness(5)).not.toThrow();
      expect(() => builder().brightness(10)).not.toThrow();
    });

    it('should reject out-of-range values', () => {
      expect(() => builder().brightness(-1)).toThrow(ViucraftValidationError);
      expect(() => builder().brightness(11)).toThrow(ViucraftValidationError);
    });
  });

  describe('contrast', () => {
    it('should accept valid range', () => {
      expect(() => builder().contrast(0)).not.toThrow();
      expect(() => builder().contrast(10)).not.toThrow();
    });

    it('should reject out-of-range values', () => {
      expect(() => builder().contrast(-0.1)).toThrow(ViucraftValidationError);
      expect(() => builder().contrast(10.1)).toThrow(ViucraftValidationError);
    });
  });

  describe('blur', () => {
    it('should accept valid sigma', () => {
      expect(() => builder().blur(0.5)).not.toThrow();
      expect(() => builder().blur(1.0)).not.toThrow();
      expect(() => builder().blur(100)).not.toThrow();
    });

    it('should reject non-positive sigma', () => {
      expect(() => builder().blur(0)).toThrow(ViucraftValidationError);
      expect(() => builder().blur(-1)).toThrow(ViucraftValidationError);
    });

    it('should use default sigma of 1.0', () => {
      const url = builder().blur().toURL();
      expect(url).toContain('blur_sigma_1');
    });
  });

  describe('sharpen', () => {
    it('should accept valid sigma', () => {
      expect(() => builder().sharpen(1.0)).not.toThrow();
      expect(() => builder().sharpen(50)).not.toThrow();
    });

    it('should reject non-positive sigma', () => {
      expect(() => builder().sharpen(0)).toThrow(ViucraftValidationError);
    });
  });

  describe('median', () => {
    it('should accept valid odd sizes', () => {
      expect(() => builder().median(1)).not.toThrow();
      expect(() => builder().median(3)).not.toThrow();
      expect(() => builder().median(99)).not.toThrow();
    });

    it('should reject even sizes', () => {
      expect(() => builder().median(2)).toThrow(ViucraftValidationError);
      expect(() => builder().median(4)).toThrow(ViucraftValidationError);
    });

    it('should reject non-positive sizes', () => {
      expect(() => builder().median(0)).toThrow(ViucraftValidationError);
      expect(() => builder().median(-1)).toThrow(ViucraftValidationError);
    });

    it('should use default size of 3', () => {
      const url = builder().median().toURL();
      expect(url).toContain('median_size_3');
    });
  });

  describe('thumbnail', () => {
    it('should generate correct format', () => {
      const url = builder().thumbnail(150, 150).toURL();
      expect(url).toContain('thumbnail_width_150_height_150');
    });

    it('should support crop strategy', () => {
      const url = builder().thumbnail(150, 150, 'entropy').toURL();
      expect(url).toContain('thumbnail_width_150_height_150_crop_entropy');
    });

    it('should reject invalid dimensions', () => {
      expect(() => builder().thumbnail(0, 100)).toThrow(ViucraftValidationError);
      expect(() => builder().thumbnail(100, 0)).toThrow(ViucraftValidationError);
    });
  });

  describe('smartCrop', () => {
    it('should generate correct format', () => {
      const url = builder().smartCrop(400, 300).toURL();
      expect(url).toContain('smartcrop_width_400_height_300');
    });

    it('should reject invalid dimensions', () => {
      expect(() => builder().smartCrop(-1, 100)).toThrow(ViucraftValidationError);
    });
  });

  describe('flip', () => {
    it('should accept horizontal', () => {
      const url = builder().flip('horizontal').toURL();
      expect(url).toContain('flip_direction_horizontal');
    });

    it('should accept vertical', () => {
      const url = builder().flip('vertical').toURL();
      expect(url).toContain('flip_direction_vertical');
    });

    it('should accept shorthand "h"', () => {
      const url = builder().flip('h').toURL();
      expect(url).toContain('flip_direction_horizontal');
    });

    it('should accept shorthand "v"', () => {
      const url = builder().flip('v').toURL();
      expect(url).toContain('flip_direction_vertical');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().flip('horizontal').toURL();
      expect(url).toContain('flip-h');
    });
  });

  describe('quality', () => {
    it('should accept values 1-100', () => {
      expect(() => builder().quality(1)).not.toThrow();
      expect(() => builder().quality(85)).not.toThrow();
      expect(() => builder().quality(100)).not.toThrow();
    });

    it('should reject out-of-range values', () => {
      expect(() => builder().quality(0)).toThrow(ViucraftValidationError);
      expect(() => builder().quality(101)).toThrow(ViucraftValidationError);
    });

    it('should generate correct standard format', () => {
      const url = builder().quality(85).toURL();
      expect(url).toContain('quality_value_85');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().quality(85).toURL();
      expect(url).toContain('q-85');
    });
  });

  describe('getInstructions', () => {
    it('should return a copy of current instructions', () => {
      const b = builder().resize(300, 200).brightness(1.5).grayscale();
      const instructions = b.getInstructions();
      expect(instructions.resize).toEqual({ width: 300, height: 200, scale: undefined });
      expect(instructions.brightness).toBe(1.5);
      expect(instructions.grayscale).toBe(true);
    });

    it('should return a copy (not a reference)', () => {
      const b = builder().resize(300, 200);
      const instructions = b.getInstructions();
      instructions.brightness = 2;
      // Original should not be modified
      const instructions2 = b.getInstructions();
      expect(instructions2.brightness).toBeUndefined();
    });
  });

  describe('chaining', () => {
    it('should support chaining multiple operations', () => {
      const url = builder()
        .resize(800, 600)
        .brightness(1.2)
        .contrast(1.1)
        .sharpen(0.5)
        .grayscale()
        .setFormat('webp')
        .toURL();

      expect(url).toContain('resize_width_800_height_600');
      expect(url).toContain('brightness_factor_1.2');
      expect(url).toContain('contrast_factor_1.1');
      expect(url).toContain('sharpen_sigma_0.5');
      expect(url).toContain('grayscale');
      expect(url).toMatch(/\.webp$/);
    });

    it('should return the builder instance from all existing chainable methods', () => {
      const b = builder();
      expect(b.resize(100, 100)).toBe(b);
      expect(b.crop(0, 0, 50, 50)).toBe(b);
      expect(b.rotate(90)).toBe(b);
      expect(b.brightness(1)).toBe(b);
      expect(b.contrast(1)).toBe(b);
      expect(b.grayscale()).toBe(b);
      expect(b.invert()).toBe(b);
      expect(b.blur(1)).toBe(b);
      expect(b.sharpen(1)).toBe(b);
      expect(b.emboss()).toBe(b);
      expect(b.median(3)).toBe(b);
      expect(b.setFormat('png')).toBe(b);
      expect(b.useShort()).toBe(b);
      expect(b.flip('h')).toBe(b);
      expect(b.quality(85)).toBe(b);
    });

    it('should return the builder instance from all new chainable methods', () => {
      const b = builder();
      expect(b.gamma()).toBe(b);
      expect(b.tint('#ffffff', '#000000')).toBe(b);
      expect(b.colorize('#ff6600')).toBe(b);
      expect(b.vignette()).toBe(b);
      expect(b.pixelate()).toBe(b);
      expect(b.noise()).toBe(b);
      expect(b.edge()).toBe(b);
      expect(b.autoEnhance()).toBe(b);
      expect(b.border()).toBe(b);
      expect(b.watermark({ text: 'Logo' })).toBe(b);
      expect(b.tiledWatermark('Logo')).toBe(b);
      expect(b.composite('img-uuid')).toBe(b);
      expect(b.svgOverlay('BASE64DATA')).toBe(b);
      expect(b.palette()).toBe(b);
      expect(b.metadataStrip()).toBe(b);
      expect(b.placeholder()).toBe(b);
      expect(b.responsive([320, 640, 1024])).toBe(b);
    });
  });

  // --- 17 new operations ---

  describe('gamma', () => {
    it('should use default value of 2.2', () => {
      const url = builder().gamma().toURL();
      expect(url).toContain('gamma_value_2.2');
    });

    it('should generate correct standard format', () => {
      const url = builder().gamma(1.8).toURL();
      expect(url).toContain('gamma_value_1.8');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().gamma(2.2).toURL();
      expect(url).toContain('gamma-2.2');
    });

    it('should store value in instructions', () => {
      const b = builder().gamma(1.5);
      expect(b.getInstructions().gamma).toBe(1.5);
    });

    it('should reject out-of-range values', () => {
      expect(() => builder().gamma(0)).toThrow(ViucraftValidationError);
      expect(() => builder().gamma(11)).toThrow(ViucraftValidationError);
    });
  });

  describe('tint', () => {
    it('should generate correct standard format with both colors', () => {
      const url = builder().tint('ffffff', '000000').toURL();
      expect(url).toContain('tint_highlight_ffffff_shadow_000000');
    });

    it('should generate correct standard format with just highlight', () => {
      const url = builder().tint('ffffff').toURL();
      expect(url).toContain('tint_highlight_ffffff');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().tint('ffffff', '000000').toURL();
      expect(url).toContain('tint-ffffff-000000');
    });

    it('should strip leading # from hex colors', () => {
      const b = builder().tint('#aabbcc', '#112233');
      const instructions = b.getInstructions();
      expect((instructions.tint as any).highlight).toBe('aabbcc');
      expect((instructions.tint as any).shadow).toBe('112233');
    });

    it('should reject invalid hex colors', () => {
      expect(() => builder().tint('xyz')).toThrow(ViucraftValidationError);
      expect(() => builder().tint('fff')).toThrow(ViucraftValidationError); // 3-char not allowed
    });
  });

  describe('colorize', () => {
    it('should generate correct standard format', () => {
      const url = builder().colorize('ff6600').toURL();
      expect(url).toContain('colorize_color_ff6600');
    });

    it('should include amount in standard format', () => {
      const url = builder().colorize('ff6600', 0.8).toURL();
      expect(url).toContain('colorize_color_ff6600_amount_0.8');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().colorize('FF6600', 0.8).toURL();
      expect(url).toContain('colorize-FF6600-0.8');
    });

    it('should reject invalid hex color', () => {
      expect(() => builder().colorize('not-hex')).toThrow(ViucraftValidationError);
    });

    it('should reject amount out of range', () => {
      expect(() => builder().colorize('ff6600', 1.5)).toThrow(ViucraftValidationError);
    });
  });

  describe('vignette', () => {
    it('should generate correct standard format with params', () => {
      const url = builder().vignette(0.3, 0.7).toURL();
      expect(url).toContain('vignette_scale_0.3_opacity_0.7');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().vignette(0.3, 0.7).toURL();
      expect(url).toContain('vig-0.3-0.7');
    });

    it('should work with no params', () => {
      const url = builder().vignette().toURL();
      expect(url).toContain('vignette');
    });

    it('should reject invalid scale', () => {
      expect(() => builder().vignette(1.5)).toThrow(ViucraftValidationError);
    });
  });

  describe('pixelate', () => {
    it('should use default size of 10', () => {
      const url = builder().pixelate().toURL();
      expect(url).toContain('pixelate_size_10');
    });

    it('should generate correct standard format', () => {
      const url = builder().pixelate(20).toURL();
      expect(url).toContain('pixelate_size_20');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().pixelate(10).toURL();
      expect(url).toContain('pix-10');
    });

    it('should reject invalid sizes', () => {
      expect(() => builder().pixelate(1)).toThrow(ViucraftValidationError);
      expect(() => builder().pixelate(101)).toThrow(ViucraftValidationError);
    });
  });

  describe('noise', () => {
    it('should generate correct standard format with type and amount', () => {
      const url = builder().noise('gaussian', 0.2).toURL();
      expect(url).toContain('noise_type_gaussian_amount_0.2');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().noise('gaussian', 0.2).toURL();
      expect(url).toContain('noise-gaussian-0.2');
    });

    it('should work with no params', () => {
      const url = builder().noise().toURL();
      expect(url).toContain('noise');
    });

    it('should reject invalid noise type', () => {
      expect(() => builder().noise('invalid' as any)).toThrow(ViucraftValidationError);
    });

    it('should reject invalid amount', () => {
      expect(() => builder().noise('gaussian', 1.5)).toThrow(ViucraftValidationError);
    });
  });

  describe('edge', () => {
    it('should generate correct standard format', () => {
      const url = builder().edge().toURL();
      expect(url).toContain('edge');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().edge().toURL();
      expect(url).toContain('edge');
    });

    it('should store true in instructions', () => {
      const b = builder().edge();
      expect(b.getInstructions().edge).toBe(true);
    });
  });

  describe('autoEnhance', () => {
    it('should use default strength of 0.5', () => {
      const url = builder().autoEnhance().toURL();
      expect(url).toContain('autoenhance_strength_0.5');
    });

    it('should generate correct standard format', () => {
      const url = builder().autoEnhance(0.8).toURL();
      expect(url).toContain('autoenhance_strength_0.8');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().autoEnhance(0.5).toURL();
      expect(url).toContain('enhance-0.5');
    });

    it('should reject invalid strength', () => {
      expect(() => builder().autoEnhance(1.5)).toThrow(ViucraftValidationError);
    });
  });

  describe('border', () => {
    it('should generate correct standard format', () => {
      const url = builder().border({ width: 10, color: '000000' }).toURL();
      expect(url).toContain('border_width_10_color_000000');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().border({ width: 10, color: '000000' }).toURL();
      expect(url).toContain('border-10-000000');
    });

    it('should work with no params', () => {
      const url = builder().border().toURL();
      expect(url).toContain('border');
    });

    it('should reject invalid width', () => {
      expect(() => builder().border({ width: 0 })).toThrow(ViucraftValidationError);
      expect(() => builder().border({ width: 201 })).toThrow(ViucraftValidationError);
    });

    it('should reject invalid color', () => {
      expect(() => builder().border({ color: 'not-hex' })).toThrow(ViucraftValidationError);
    });
  });

  describe('watermark', () => {
    it('should generate correct standard format for text watermark', () => {
      const url = builder().watermark({ text: 'Logo', opacity: 0.5 }).toURL();
      expect(url).toContain('watermark_text_Logo_opacity_0.5');
    });

    it('should generate correct standard format for image watermark', () => {
      const url = builder().watermark({ image: 'overlay-uuid' }).toURL();
      expect(url).toContain('watermark_image_overlay-uuid');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().watermark({ text: 'Logo', opacity: 0.5 }).toURL();
      expect(url).toContain('wm-Logo-0.5');
    });

    it('should reject empty text', () => {
      expect(() => builder().watermark({ text: '' })).toThrow(ViucraftValidationError);
    });

    it('should reject opacity out of range', () => {
      expect(() => builder().watermark({ text: 'Logo', opacity: 1.5 })).toThrow(ViucraftValidationError);
    });
  });

  describe('tiledWatermark', () => {
    it('should generate correct standard format', () => {
      const url = builder().tiledWatermark('Logo').toURL();
      expect(url).toContain('tiled_watermark_text_Logo');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().tiledWatermark('Logo').toURL();
      expect(url).toContain('twm-Logo');
    });

    it('should reject empty text', () => {
      expect(() => builder().tiledWatermark('')).toThrow(ViucraftValidationError);
    });
  });

  describe('composite', () => {
    it('should generate correct standard format', () => {
      const url = builder().composite('overlay-uuid', { mode: 'over' }).toURL();
      expect(url).toContain('composite_image_overlay-uuid_mode_over');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().composite('overlay-uuid', { mode: 'over' }).toURL();
      expect(url).toContain('comp-overlay-uuid-over');
    });

    it('should reject empty imageId', () => {
      expect(() => builder().composite('')).toThrow(ViucraftValidationError);
    });

    it('should reject invalid blend mode', () => {
      expect(() => builder().composite('uuid', { mode: 'invalid' as any })).toThrow(ViucraftValidationError);
    });
  });

  describe('svgOverlay', () => {
    it('should generate correct standard format', () => {
      const url = builder().svgOverlay('BASE64DATA').toURL();
      expect(url).toContain('svg_overlay_data_BASE64DATA');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().svgOverlay('BASE64DATA').toURL();
      expect(url).toContain('svg-BASE64DATA');
    });

    it('should reject empty data', () => {
      expect(() => builder().svgOverlay('')).toThrow(ViucraftValidationError);
    });
  });

  describe('palette', () => {
    it('should use default count of 5', () => {
      const url = builder().palette().toURL();
      expect(url).toContain('palette_count_5');
    });

    it('should generate correct standard format', () => {
      const url = builder().palette(8).toURL();
      expect(url).toContain('palette_count_8');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().palette(5).toURL();
      expect(url).toContain('palette-5');
    });

    it('should reject count out of range', () => {
      expect(() => builder().palette(2)).toThrow(ViucraftValidationError);
      expect(() => builder().palette(11)).toThrow(ViucraftValidationError);
    });
  });

  describe('metadataStrip', () => {
    it('should generate correct standard format', () => {
      const url = builder().metadataStrip().toURL();
      expect(url).toContain('strip');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().metadataStrip().toURL();
      expect(url).toContain('strip');
    });

    it('should store true in instructions', () => {
      const b = builder().metadataStrip();
      expect(b.getInstructions().metadataStrip).toBe(true);
    });
  });

  describe('placeholder', () => {
    it('should use default size of 32', () => {
      const url = builder().placeholder().toURL();
      expect(url).toContain('placeholder_size_32');
    });

    it('should generate correct standard format', () => {
      const url = builder().placeholder(64).toURL();
      expect(url).toContain('placeholder_size_64');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().placeholder(32).toURL();
      expect(url).toContain('lqip-32');
    });

    it('should reject size out of range', () => {
      expect(() => builder().placeholder(7)).toThrow(ViucraftValidationError);
      expect(() => builder().placeholder(129)).toThrow(ViucraftValidationError);
    });
  });

  describe('responsive', () => {
    it('should generate correct standard format', () => {
      const url = builder().responsive([320, 640, 1024]).toURL();
      expect(url).toContain('responsive_widths_320,640,1024');
    });

    it('should include format when provided', () => {
      const url = builder().responsive([320, 640, 1024], 'webp').toURL();
      expect(url).toContain('responsive_widths_320,640,1024_format_webp');
    });

    it('should generate correct short format', () => {
      const url = builder().useShort().responsive([320, 640, 1024], 'webp').toURL();
      expect(url).toContain('resp-320,640,1024-webp');
    });

    it('should reject empty widths array', () => {
      expect(() => builder().responsive([])).toThrow(ViucraftValidationError);
    });

    it('should reject non-positive widths', () => {
      expect(() => builder().responsive([0, 640])).toThrow(ViucraftValidationError);
      expect(() => builder().responsive([-1, 640])).toThrow(ViucraftValidationError);
    });
  });
});
