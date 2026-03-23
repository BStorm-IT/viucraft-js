import { formatProcessingInstructions, formatShortInstructions } from '../utils';
import { ProcessingInstructions } from '../types';

describe('formatProcessingInstructions (standard format)', () => {
  it('should format resize', () => {
    const result = formatProcessingInstructions({ resize: { width: 300, height: 200 } });
    expect(result).toBe('resize_width_300_height_200');
  });

  it('should format resize with scale', () => {
    const result = formatProcessingInstructions({ resize: { width: 300, height: 200, scale: 2 } });
    expect(result).toBe('resize_width_300_height_200_scale_2');
  });

  it('should format crop', () => {
    const result = formatProcessingInstructions({ crop: { left: 10, top: 20, width: 100, height: 50 } });
    expect(result).toBe('crop_left_10_top_20_width_100_height_50');
  });

  it('should format rotate', () => {
    const result = formatProcessingInstructions({ rotate: { angle: 90 } });
    expect(result).toBe('rotate_angle_90');
  });

  it('should format rotate with background', () => {
    const result = formatProcessingInstructions({ rotate: { angle: 45, background: '#ff0000' } });
    expect(result).toBe('rotate_angle_45_background_ff0000');
  });

  it('should format brightness as number', () => {
    const result = formatProcessingInstructions({ brightness: 1.5 });
    expect(result).toBe('brightness_factor_1.5');
  });

  it('should format brightness as object', () => {
    const result = formatProcessingInstructions({ brightness: { factor: 1.2 } });
    expect(result).toBe('brightness_factor_1.2');
  });

  it('should format contrast as number', () => {
    const result = formatProcessingInstructions({ contrast: 1.3 });
    expect(result).toBe('contrast_factor_1.3');
  });

  it('should format grayscale', () => {
    const result = formatProcessingInstructions({ grayscale: true });
    expect(result).toBe('grayscale');
  });

  it('should format invert', () => {
    const result = formatProcessingInstructions({ invert: true });
    expect(result).toBe('invert');
  });

  it('should format blur as number', () => {
    const result = formatProcessingInstructions({ blur: 2.5 });
    expect(result).toBe('blur_sigma_2.5');
  });

  it('should format blur as object', () => {
    const result = formatProcessingInstructions({ blur: { sigma: 3 } });
    expect(result).toBe('blur_sigma_3');
  });

  it('should format sharpen', () => {
    const result = formatProcessingInstructions({ sharpen: 1.5 });
    expect(result).toBe('sharpen_sigma_1.5');
  });

  it('should format emboss', () => {
    const result = formatProcessingInstructions({ emboss: true });
    expect(result).toBe('emboss');
  });

  it('should format median as number', () => {
    const result = formatProcessingInstructions({ median: 5 });
    expect(result).toBe('median_size_5');
  });

  it('should format thumbnail', () => {
    const result = formatProcessingInstructions({ thumbnail: { width: 150, height: 150 } });
    expect(result).toBe('thumbnail_width_150_height_150');
  });

  it('should format thumbnail with crop', () => {
    const result = formatProcessingInstructions({ thumbnail: { width: 150, height: 150, crop: 'entropy' } });
    expect(result).toBe('thumbnail_width_150_height_150_crop_entropy');
  });

  it('should format smartcrop', () => {
    const result = formatProcessingInstructions({ smartcrop: { width: 400, height: 300 } });
    expect(result).toBe('smartcrop_width_400_height_300');
  });

  it('should format flip horizontal', () => {
    const result = formatProcessingInstructions({ flip: { direction: 'horizontal' } });
    expect(result).toBe('flip_direction_horizontal');
  });

  it('should format flip vertical', () => {
    const result = formatProcessingInstructions({ flip: { direction: 'vertical' } });
    expect(result).toBe('flip_direction_vertical');
  });

  it('should normalize flip short direction "h"', () => {
    const result = formatProcessingInstructions({ flip: { direction: 'h' } });
    expect(result).toBe('flip_direction_horizontal');
  });

  it('should normalize flip short direction "v"', () => {
    const result = formatProcessingInstructions({ flip: { direction: 'v' } });
    expect(result).toBe('flip_direction_vertical');
  });

  it('should format quality', () => {
    const result = formatProcessingInstructions({ quality: 85 });
    expect(result).toBe('quality_value_85');
  });

  it('should join multiple operations with /', () => {
    const result = formatProcessingInstructions({
      resize: { width: 300, height: 200 },
      grayscale: true,
      brightness: 1.2,
    });
    expect(result).toBe('resize_width_300_height_200/brightness_factor_1.2/grayscale');
  });

  it('should return string instructions as-is', () => {
    const result = formatProcessingInstructions('resize-300-200');
    expect(result).toBe('resize-300-200');
  });

  it('should return empty string for empty instructions', () => {
    const result = formatProcessingInstructions({});
    expect(result).toBe('');
  });

  // --- 17 new operations ---

  it('should format gamma as number', () => {
    const result = formatProcessingInstructions({ gamma: 2.2 });
    expect(result).toBe('gamma_value_2.2');
  });

  it('should format gamma as object', () => {
    const result = formatProcessingInstructions({ gamma: { value: 1.8 } });
    expect(result).toBe('gamma_value_1.8');
  });

  it('should format tint with both colors', () => {
    const result = formatProcessingInstructions({ tint: { highlight: 'FFFFFF', shadow: '000000' } });
    expect(result).toBe('tint_highlight_FFFFFF_shadow_000000');
  });

  it('should format tint with highlight only', () => {
    const result = formatProcessingInstructions({ tint: { highlight: 'FFFFFF' } });
    expect(result).toBe('tint_highlight_FFFFFF');
  });

  it('should format tint with shadow only', () => {
    const result = formatProcessingInstructions({ tint: { shadow: '000000' } });
    expect(result).toBe('tint_shadow_000000');
  });

  it('should format colorize without amount', () => {
    const result = formatProcessingInstructions({ colorize: { color: 'FF6600' } });
    expect(result).toBe('colorize_color_FF6600');
  });

  it('should format colorize with amount', () => {
    const result = formatProcessingInstructions({ colorize: { color: 'FF6600', amount: 0.8 } });
    expect(result).toBe('colorize_color_FF6600_amount_0.8');
  });

  it('should format vignette with scale and opacity', () => {
    const result = formatProcessingInstructions({ vignette: { scale: 0.3, opacity: 0.7 } });
    expect(result).toBe('vignette_scale_0.3_opacity_0.7');
  });

  it('should format vignette with color', () => {
    const result = formatProcessingInstructions({ vignette: { scale: 0.3, opacity: 0.7, color: '000000' } });
    expect(result).toBe('vignette_scale_0.3_opacity_0.7_color_000000');
  });

  it('should format vignette with empty object', () => {
    const result = formatProcessingInstructions({ vignette: {} });
    expect(result).toBe('vignette');
  });

  it('should format pixelate as number', () => {
    const result = formatProcessingInstructions({ pixelate: 10 });
    expect(result).toBe('pixelate_size_10');
  });

  it('should format pixelate as object', () => {
    const result = formatProcessingInstructions({ pixelate: { size: 20 } });
    expect(result).toBe('pixelate_size_20');
  });

  it('should format noise with type and amount', () => {
    const result = formatProcessingInstructions({ noise: { type: 'gaussian', amount: 0.2 } });
    expect(result).toBe('noise_type_gaussian_amount_0.2');
  });

  it('should format noise with type only', () => {
    const result = formatProcessingInstructions({ noise: { type: 'salt' } });
    expect(result).toBe('noise_type_salt');
  });

  it('should format noise with empty object', () => {
    const result = formatProcessingInstructions({ noise: {} });
    expect(result).toBe('noise');
  });

  it('should format edge', () => {
    const result = formatProcessingInstructions({ edge: true });
    expect(result).toBe('edge');
  });

  it('should format autoEnhance as number', () => {
    const result = formatProcessingInstructions({ autoEnhance: 0.5 });
    expect(result).toBe('autoenhance_strength_0.5');
  });

  it('should format autoEnhance as object', () => {
    const result = formatProcessingInstructions({ autoEnhance: { strength: 0.8 } });
    expect(result).toBe('autoenhance_strength_0.8');
  });

  it('should format border with width and color', () => {
    const result = formatProcessingInstructions({ border: { width: 10, color: '000000' } });
    expect(result).toBe('border_width_10_color_000000');
  });

  it('should format border with all params', () => {
    const result = formatProcessingInstructions({ border: { width: 10, color: '000000', radius: 5, shadowBlur: 4, shadowColor: 'aabbcc', shadowX: 2, shadowY: 2 } });
    expect(result).toBe('border_width_10_color_000000_radius_5_shadow_blur_4_shadow_color_aabbcc_shadow_x_2_shadow_y_2');
  });

  it('should format border with empty object', () => {
    const result = formatProcessingInstructions({ border: {} });
    expect(result).toBe('border');
  });

  it('should format text watermark', () => {
    const result = formatProcessingInstructions({ watermark: { text: 'Logo', opacity: 0.5 } });
    expect(result).toBe('watermark_text_Logo_opacity_0.5');
  });

  it('should format image watermark', () => {
    const result = formatProcessingInstructions({ watermark: { image: 'overlay-uuid' } });
    expect(result).toBe('watermark_image_overlay-uuid');
  });

  it('should format tiledWatermark', () => {
    const result = formatProcessingInstructions({ tiledWatermark: { text: 'Logo' } });
    expect(result).toBe('tiled_watermark_text_Logo');
  });

  it('should format tiledWatermark with options', () => {
    const result = formatProcessingInstructions({ tiledWatermark: { text: 'Logo', size: 14, opacity: 50, spacing: 20 } });
    expect(result).toBe('tiled_watermark_text_Logo_size_14_opacity_50_spacing_20');
  });

  it('should format composite with mode', () => {
    const result = formatProcessingInstructions({ composite: { image: 'overlay-uuid', mode: 'over' } });
    expect(result).toBe('composite_image_overlay-uuid_mode_over');
  });

  it('should format composite without mode', () => {
    const result = formatProcessingInstructions({ composite: { image: 'overlay-uuid' } });
    expect(result).toBe('composite_image_overlay-uuid');
  });

  it('should format svgOverlay', () => {
    const result = formatProcessingInstructions({ svgOverlay: { data: 'BASE64DATA' } });
    expect(result).toBe('svg_overlay_data_BASE64DATA');
  });

  it('should format svgOverlay with all params', () => {
    const result = formatProcessingInstructions({ svgOverlay: { data: 'BASE64', x: 10, y: 20, scale: 1.5, opacity: 80 } });
    expect(result).toBe('svg_overlay_data_BASE64_x_10_y_20_scale_1.5_opacity_80');
  });

  it('should format palette as number', () => {
    const result = formatProcessingInstructions({ palette: 5 });
    expect(result).toBe('palette_count_5');
  });

  it('should format palette as object', () => {
    const result = formatProcessingInstructions({ palette: { count: 8 } });
    expect(result).toBe('palette_count_8');
  });

  it('should format palette with width and height', () => {
    const result = formatProcessingInstructions({ palette: { count: 5, width: 100, height: 50 } });
    expect(result).toBe('palette_count_5_width_100_height_50');
  });

  it('should format metadataStrip', () => {
    const result = formatProcessingInstructions({ metadataStrip: true });
    expect(result).toBe('strip');
  });

  it('should format placeholder as number', () => {
    const result = formatProcessingInstructions({ placeholder: 32 });
    expect(result).toBe('placeholder_size_32');
  });

  it('should format placeholder as object', () => {
    const result = formatProcessingInstructions({ placeholder: { size: 64 } });
    expect(result).toBe('placeholder_size_64');
  });

  it('should format responsive', () => {
    const result = formatProcessingInstructions({ responsive: { widths: [320, 640, 1024] } });
    expect(result).toBe('responsive_widths_320,640,1024');
  });

  it('should format responsive with format', () => {
    const result = formatProcessingInstructions({ responsive: { widths: [320, 640, 1024], format: 'webp' } });
    expect(result).toBe('responsive_widths_320,640,1024_format_webp');
  });
});

describe('formatShortInstructions', () => {
  it('should format resize', () => {
    const result = formatShortInstructions({ resize: { width: 300, height: 200 } });
    expect(result).toBe('resize-300-200');
  });

  it('should format crop', () => {
    const result = formatShortInstructions({ crop: { left: 10, top: 20, width: 100, height: 50 } });
    expect(result).toBe('crop-10-20-100-50');
  });

  it('should format rotate', () => {
    const result = formatShortInstructions({ rotate: { angle: 90 } });
    expect(result).toBe('rotate-90');
  });

  it('should format rotate with background', () => {
    const result = formatShortInstructions({ rotate: { angle: 45, background: '#ff0000' } });
    expect(result).toBe('rotate-45-ff0000');
  });

  it('should format brightness', () => {
    const result = formatShortInstructions({ brightness: 1.5 });
    expect(result).toBe('bright-1.5');
  });

  it('should format contrast', () => {
    const result = formatShortInstructions({ contrast: 1.3 });
    expect(result).toBe('con-1.3');
  });

  it('should format grayscale', () => {
    const result = formatShortInstructions({ grayscale: true });
    expect(result).toBe('gray');
  });

  it('should format invert', () => {
    const result = formatShortInstructions({ invert: true });
    expect(result).toBe('inv');
  });

  it('should format blur', () => {
    const result = formatShortInstructions({ blur: 2.5 });
    expect(result).toBe('blur-2.5');
  });

  it('should format sharpen', () => {
    const result = formatShortInstructions({ sharpen: 1.5 });
    expect(result).toBe('sharp-1.5');
  });

  it('should format emboss', () => {
    const result = formatShortInstructions({ emboss: true });
    expect(result).toBe('emb');
  });

  it('should format median', () => {
    const result = formatShortInstructions({ median: 5 });
    expect(result).toBe('med-5');
  });

  it('should format thumbnail', () => {
    const result = formatShortInstructions({ thumbnail: { width: 150, height: 150 } });
    expect(result).toBe('thumb-150-150');
  });

  it('should format thumbnail with crop', () => {
    const result = formatShortInstructions({ thumbnail: { width: 150, height: 150, crop: 'attention' } });
    expect(result).toBe('thumb-150-150-attention');
  });

  it('should format smartcrop', () => {
    const result = formatShortInstructions({ smartcrop: { width: 400, height: 300 } });
    expect(result).toBe('scrop-400-300');
  });

  it('should format flip horizontal', () => {
    const result = formatShortInstructions({ flip: { direction: 'horizontal' } });
    expect(result).toBe('flip-h');
  });

  it('should format flip vertical', () => {
    const result = formatShortInstructions({ flip: { direction: 'vertical' } });
    expect(result).toBe('flip-v');
  });

  it('should format flip short direction "h"', () => {
    const result = formatShortInstructions({ flip: { direction: 'h' } });
    expect(result).toBe('flip-h');
  });

  it('should format flip short direction "v"', () => {
    const result = formatShortInstructions({ flip: { direction: 'v' } });
    expect(result).toBe('flip-v');
  });

  it('should format quality', () => {
    const result = formatShortInstructions({ quality: 85 });
    expect(result).toBe('q-85');
  });

  it('should return empty string for empty instructions', () => {
    const result = formatShortInstructions({});
    expect(result).toBe('');
  });

  // --- 17 new operations ---

  it('should format gamma', () => {
    const result = formatShortInstructions({ gamma: 2.2 });
    expect(result).toBe('gamma-2.2');
  });

  it('should format tint with both colors', () => {
    const result = formatShortInstructions({ tint: { highlight: 'FFFFFF', shadow: '000000' } });
    expect(result).toBe('tint-FFFFFF-000000');
  });

  it('should format tint with highlight only', () => {
    const result = formatShortInstructions({ tint: { highlight: 'FFFFFF' } });
    expect(result).toBe('tint-FFFFFF');
  });

  it('should format colorize without amount', () => {
    const result = formatShortInstructions({ colorize: { color: 'FF6600' } });
    expect(result).toBe('colorize-FF6600');
  });

  it('should format colorize with amount', () => {
    const result = formatShortInstructions({ colorize: { color: 'FF6600', amount: 0.8 } });
    expect(result).toBe('colorize-FF6600-0.8');
  });

  it('should format vignette with scale and opacity', () => {
    const result = formatShortInstructions({ vignette: { scale: 0.3, opacity: 0.7 } });
    expect(result).toBe('vig-0.3-0.7');
  });

  it('should format vignette with no params', () => {
    const result = formatShortInstructions({ vignette: {} });
    expect(result).toBe('vig');
  });

  it('should format pixelate', () => {
    const result = formatShortInstructions({ pixelate: 10 });
    expect(result).toBe('pix-10');
  });

  it('should format noise with type and amount', () => {
    const result = formatShortInstructions({ noise: { type: 'gaussian', amount: 0.2 } });
    expect(result).toBe('noise-gaussian-0.2');
  });

  it('should format noise with empty object', () => {
    const result = formatShortInstructions({ noise: {} });
    expect(result).toBe('noise');
  });

  it('should format edge', () => {
    const result = formatShortInstructions({ edge: true });
    expect(result).toBe('edge');
  });

  it('should format autoEnhance', () => {
    const result = formatShortInstructions({ autoEnhance: 0.5 });
    expect(result).toBe('enhance-0.5');
  });

  it('should format border with width and color', () => {
    const result = formatShortInstructions({ border: { width: 10, color: '000000' } });
    expect(result).toBe('border-10-000000');
  });

  it('should format border with no params', () => {
    const result = formatShortInstructions({ border: {} });
    expect(result).toBe('border');
  });

  it('should format text watermark', () => {
    const result = formatShortInstructions({ watermark: { text: 'Logo', opacity: 0.5 } });
    expect(result).toBe('wm-Logo-0.5');
  });

  it('should format image watermark', () => {
    const result = formatShortInstructions({ watermark: { image: 'overlay-uuid' } });
    expect(result).toBe('wm-overlay-uuid');
  });

  it('should format tiledWatermark', () => {
    const result = formatShortInstructions({ tiledWatermark: { text: 'Logo' } });
    expect(result).toBe('twm-Logo');
  });

  it('should format composite with mode', () => {
    const result = formatShortInstructions({ composite: { image: 'overlay-uuid', mode: 'over' } });
    expect(result).toBe('comp-overlay-uuid-over');
  });

  it('should format composite without mode', () => {
    const result = formatShortInstructions({ composite: { image: 'overlay-uuid' } });
    expect(result).toBe('comp-overlay-uuid');
  });

  it('should format svgOverlay', () => {
    const result = formatShortInstructions({ svgOverlay: { data: 'BASE64DATA' } });
    expect(result).toBe('svg-BASE64DATA');
  });

  it('should format palette as number', () => {
    const result = formatShortInstructions({ palette: 5 });
    expect(result).toBe('palette-5');
  });

  it('should format palette as object', () => {
    const result = formatShortInstructions({ palette: { count: 8 } });
    expect(result).toBe('palette-8');
  });

  it('should format metadataStrip', () => {
    const result = formatShortInstructions({ metadataStrip: true });
    expect(result).toBe('strip');
  });

  it('should format placeholder', () => {
    const result = formatShortInstructions({ placeholder: 32 });
    expect(result).toBe('lqip-32');
  });

  it('should format placeholder as object', () => {
    const result = formatShortInstructions({ placeholder: { size: 64 } });
    expect(result).toBe('lqip-64');
  });

  it('should format responsive', () => {
    const result = formatShortInstructions({ responsive: { widths: [320, 640, 1024] } });
    expect(result).toBe('resp-320,640,1024');
  });

  it('should format responsive with format', () => {
    const result = formatShortInstructions({ responsive: { widths: [320, 640, 1024], format: 'webp' } });
    expect(result).toBe('resp-320,640,1024-webp');
  });
});
