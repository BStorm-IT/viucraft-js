import { ProcessingInstructions } from './types';

/**
 * Converts processing instructions object to URL path segment
 */
export function formatProcessingInstructions(instructions: ProcessingInstructions | string): string {
  // If instructions is already a string, return it as is (assuming it's already in the correct format)
  if (typeof instructions === 'string') {
    return instructions;
  }

  const segments: string[] = [];

  // Handle resize operation
  if (instructions.resize) {
    const { width, height, scale } = instructions.resize;
    if (scale) {
      segments.push(`resize_width_${width}_height_${height}_scale_${scale}`);
    } else {
      segments.push(`resize_width_${width}_height_${height}`);
    }
  }

  // Handle crop operation
  if (instructions.crop) {
    const { left, top, width, height } = instructions.crop;
    segments.push(`crop_left_${left}_top_${top}_width_${width}_height_${height}`);
  }

  // Handle rotate operation
  if (instructions.rotate) {
    const { angle, background } = instructions.rotate;
    if (background) {
      segments.push(`rotate_angle_${angle}_background_${background.replace('#', '')}`);
    } else {
      segments.push(`rotate_angle_${angle}`);
    }
  }

  // Handle brightness operation
  if (instructions.brightness !== undefined) {
    const factor = typeof instructions.brightness === 'number' 
      ? instructions.brightness 
      : instructions.brightness.factor;
    segments.push(`brightness_factor_${factor}`);
  }

  // Handle contrast operation
  if (instructions.contrast !== undefined) {
    const factor = typeof instructions.contrast === 'number' 
      ? instructions.contrast 
      : instructions.contrast.factor;
    segments.push(`contrast_factor_${factor}`);
  }

  // Handle grayscale operation
  if (instructions.grayscale) {
    segments.push('grayscale');
  }

  // Handle invert operation
  if (instructions.invert) {
    segments.push('invert');
  }

  // Handle blur operation
  if (instructions.blur !== undefined) {
    const sigma = typeof instructions.blur === 'number' 
      ? instructions.blur 
      : instructions.blur.sigma;
    segments.push(`blur_sigma_${sigma}`);
  }

  // Handle sharpen operation
  if (instructions.sharpen !== undefined) {
    const sigma = typeof instructions.sharpen === 'number' 
      ? instructions.sharpen 
      : instructions.sharpen.sigma;
    segments.push(`sharpen_sigma_${sigma}`);
  }

  // Handle emboss operation
  if (instructions.emboss) {
    segments.push('emboss');
  }

  // Handle median operation
  if (instructions.median !== undefined) {
    const size = typeof instructions.median === 'number' 
      ? instructions.median 
      : instructions.median.size;
    segments.push(`median_size_${size}`);
  }

  // Handle thumbnail operation
  if (instructions.thumbnail) {
    const { width, height, crop } = instructions.thumbnail;
    if (crop) {
      segments.push(`thumbnail_width_${width}_height_${height}_crop_${crop}`);
    } else {
      segments.push(`thumbnail_width_${width}_height_${height}`);
    }
  }

  // Handle smartcrop operation
  if (instructions.smartcrop) {
    const { width, height } = instructions.smartcrop;
    segments.push(`smartcrop_width_${width}_height_${height}`);
  }

  // Handle flip operation
  if (instructions.flip) {
    const dir = instructions.flip.direction;
    const normalized = dir === 'h' ? 'horizontal' : dir === 'v' ? 'vertical' : dir;
    segments.push(`flip_direction_${normalized}`);
  }

  // Handle quality operation
  if (instructions.quality !== undefined) {
    segments.push(`quality_value_${instructions.quality}`);
  }

  // Handle gamma operation
  if (instructions.gamma !== undefined) {
    const value = typeof instructions.gamma === 'number'
      ? instructions.gamma
      : instructions.gamma.value;
    segments.push(`gamma_value_${value}`);
  }

  // Handle tint operation
  if (instructions.tint) {
    const parts = ['tint'];
    if (instructions.tint.highlight) parts.push(`highlight_${instructions.tint.highlight.replace('#', '')}`);
    if (instructions.tint.shadow) parts.push(`shadow_${instructions.tint.shadow.replace('#', '')}`);
    segments.push(parts.join('_'));
  }

  // Handle colorize operation
  if (instructions.colorize) {
    const parts = ['colorize', `color_${instructions.colorize.color.replace('#', '')}`];
    if (instructions.colorize.amount !== undefined) parts.push(`amount_${instructions.colorize.amount}`);
    segments.push(parts.join('_'));
  }

  // Handle vignette operation
  if (instructions.vignette) {
    const parts = ['vignette'];
    if (instructions.vignette.scale !== undefined) parts.push(`scale_${instructions.vignette.scale}`);
    if (instructions.vignette.opacity !== undefined) parts.push(`opacity_${instructions.vignette.opacity}`);
    if (instructions.vignette.color) parts.push(`color_${instructions.vignette.color.replace('#', '')}`);
    segments.push(parts.join('_'));
  }

  // Handle pixelate operation
  if (instructions.pixelate !== undefined) {
    const size = typeof instructions.pixelate === 'number'
      ? instructions.pixelate
      : instructions.pixelate.size ?? 10;
    segments.push(`pixelate_size_${size}`);
  }

  // Handle noise operation
  if (instructions.noise) {
    const parts = ['noise'];
    if (instructions.noise.type) parts.push(`type_${instructions.noise.type}`);
    if (instructions.noise.amount !== undefined) parts.push(`amount_${instructions.noise.amount}`);
    segments.push(parts.join('_'));
  }

  // Handle edge operation
  if (instructions.edge) {
    segments.push('edge');
  }

  // Handle autoEnhance operation
  if (instructions.autoEnhance !== undefined) {
    const strength = typeof instructions.autoEnhance === 'number'
      ? instructions.autoEnhance
      : instructions.autoEnhance.strength ?? 0.5;
    segments.push(`autoenhance_strength_${strength}`);
  }

  // Handle border operation
  if (instructions.border) {
    const b = instructions.border;
    const parts = ['border'];
    if (b.width !== undefined) parts.push(`width_${b.width}`);
    if (b.color) parts.push(`color_${b.color.replace('#', '')}`);
    if (b.radius !== undefined) parts.push(`radius_${b.radius}`);
    if (b.shadowBlur !== undefined) parts.push(`shadow_blur_${b.shadowBlur}`);
    if (b.shadowColor) parts.push(`shadow_color_${b.shadowColor.replace('#', '')}`);
    if (b.shadowX !== undefined) parts.push(`shadow_x_${b.shadowX}`);
    if (b.shadowY !== undefined) parts.push(`shadow_y_${b.shadowY}`);
    segments.push(parts.join('_'));
  }

  // Handle watermark operation
  if (instructions.watermark) {
    const w = instructions.watermark;
    const parts = ['watermark'];
    if ('text' in w) {
      parts.push(`text_${encodeURIComponent(w.text)}`);
    } else {
      parts.push(`image_${w.image}`);
    }
    if (w.opacity !== undefined) parts.push(`opacity_${w.opacity}`);
    if (w.position) parts.push(`position_${w.position}`);
    if (w.x !== undefined) parts.push(`x_${w.x}`);
    if (w.y !== undefined) parts.push(`y_${w.y}`);
    if (w.rotation !== undefined) parts.push(`rotation_${w.rotation}`);
    if (w.size !== undefined) parts.push(`size_${w.size}`);
    if ('color' in w && w.color) parts.push(`color_${w.color.replace('#', '')}`);
    if ('font' in w && w.font) parts.push(`font_${w.font}`);
    segments.push(parts.join('_'));
  }

  // Handle tiled watermark operation
  if (instructions.tiledWatermark) {
    const tw = instructions.tiledWatermark;
    const parts = ['tiled_watermark', `text_${encodeURIComponent(tw.text)}`];
    if (tw.size !== undefined) parts.push(`size_${tw.size}`);
    if (tw.color) parts.push(`color_${tw.color.replace('#', '')}`);
    if (tw.opacity !== undefined) parts.push(`opacity_${tw.opacity}`);
    if (tw.spacing !== undefined) parts.push(`spacing_${tw.spacing}`);
    if (tw.rotation !== undefined) parts.push(`rotation_${tw.rotation}`);
    segments.push(parts.join('_'));
  }

  // Handle composite operation
  if (instructions.composite) {
    const c = instructions.composite;
    const parts = ['composite', `image_${c.image}`];
    if (c.mode) parts.push(`mode_${c.mode}`);
    if (c.x !== undefined) parts.push(`x_${c.x}`);
    if (c.y !== undefined) parts.push(`y_${c.y}`);
    segments.push(parts.join('_'));
  }

  // Handle SVG overlay operation
  if (instructions.svgOverlay) {
    const s = instructions.svgOverlay;
    const parts = ['svg_overlay', `data_${s.data}`];
    if (s.x !== undefined) parts.push(`x_${s.x}`);
    if (s.y !== undefined) parts.push(`y_${s.y}`);
    if (s.scale !== undefined) parts.push(`scale_${s.scale}`);
    if (s.opacity !== undefined) parts.push(`opacity_${s.opacity}`);
    segments.push(parts.join('_'));
  }

  // Handle palette operation
  if (instructions.palette !== undefined) {
    const p = typeof instructions.palette === 'number'
      ? { count: instructions.palette }
      : instructions.palette;
    const parts = ['palette', `count_${p.count ?? 5}`];
    if (p.width !== undefined) parts.push(`width_${p.width}`);
    if (p.height !== undefined) parts.push(`height_${p.height}`);
    segments.push(parts.join('_'));
  }

  // Handle metadata strip operation
  if (instructions.metadataStrip) {
    segments.push('strip');
  }

  // Handle placeholder operation
  if (instructions.placeholder !== undefined) {
    const size = typeof instructions.placeholder === 'number'
      ? instructions.placeholder
      : instructions.placeholder.size ?? 32;
    segments.push(`placeholder_size_${size}`);
  }

  // Handle responsive operation
  if (instructions.responsive) {
    const r = instructions.responsive;
    const parts = ['responsive', `widths_${r.widths.join(',')}`];
    if (r.format) parts.push(`format_${r.format}`);
    segments.push(parts.join('_'));
  }

  return segments.join('/');
}

/**
 * Formats instructions in short format
 */
export function formatShortInstructions(instructions: ProcessingInstructions): string {
  const segments: string[] = [];

  // Handle resize operation
  if (instructions.resize) {
    const { width, height } = instructions.resize;
    segments.push(`resize-${width}-${height}`);
  }

  // Handle crop operation
  if (instructions.crop) {
    const { left, top, width, height } = instructions.crop;
    segments.push(`crop-${left}-${top}-${width}-${height}`);
  }

  // Handle rotate operation
  if (instructions.rotate) {
    const { angle, background } = instructions.rotate;
    if (background) {
      segments.push(`rotate-${angle}-${background.replace('#', '')}`);
    } else {
      segments.push(`rotate-${angle}`);
    }
  }

  // Handle brightness operation
  if (instructions.brightness !== undefined) {
    const factor = typeof instructions.brightness === 'number' 
      ? instructions.brightness 
      : instructions.brightness.factor;
    segments.push(`bright-${factor}`);
  }

  // Handle contrast operation
  if (instructions.contrast !== undefined) {
    const factor = typeof instructions.contrast === 'number' 
      ? instructions.contrast 
      : instructions.contrast.factor;
    segments.push(`con-${factor}`);
  }

  // Handle grayscale operation
  if (instructions.grayscale) {
    segments.push('gray');
  }

  // Handle invert operation
  if (instructions.invert) {
    segments.push('inv');
  }

  // Handle blur operation
  if (instructions.blur !== undefined) {
    const sigma = typeof instructions.blur === 'number' 
      ? instructions.blur 
      : instructions.blur.sigma;
    segments.push(`blur-${sigma}`);
  }

  // Handle sharpen operation
  if (instructions.sharpen !== undefined) {
    const sigma = typeof instructions.sharpen === 'number' 
      ? instructions.sharpen 
      : instructions.sharpen.sigma;
    segments.push(`sharp-${sigma}`);
  }

  // Handle emboss operation
  if (instructions.emboss) {
    segments.push('emb');
  }

  // Handle median operation
  if (instructions.median !== undefined) {
    const size = typeof instructions.median === 'number' 
      ? instructions.median 
      : instructions.median.size;
    segments.push(`med-${size}`);
  }

  // Handle thumbnail operation
  if (instructions.thumbnail) {
    const { width, height, crop } = instructions.thumbnail;
    if (crop) {
      segments.push(`thumb-${width}-${height}-${crop}`);
    } else {
      segments.push(`thumb-${width}-${height}`);
    }
  }

  // Handle smartcrop operation
  if (instructions.smartcrop) {
    const { width, height } = instructions.smartcrop;
    segments.push(`scrop-${width}-${height}`);
  }

  // Handle flip operation
  if (instructions.flip) {
    const dir = instructions.flip.direction;
    const short = (dir === 'horizontal' || dir === 'h') ? 'h' : 'v';
    segments.push(`flip-${short}`);
  }

  // Handle quality operation
  if (instructions.quality !== undefined) {
    segments.push(`q-${instructions.quality}`);
  }

  // gamma
  if (instructions.gamma !== undefined) {
    const v = typeof instructions.gamma === 'number' ? instructions.gamma : instructions.gamma.value;
    segments.push(`gamma-${v}`);
  }

  // tint
  if (instructions.tint) {
    const parts = ['tint'];
    if (instructions.tint.highlight) parts.push(instructions.tint.highlight.replace('#', ''));
    if (instructions.tint.shadow) parts.push(instructions.tint.shadow.replace('#', ''));
    segments.push(parts.join('-'));
  }

  // colorize
  if (instructions.colorize) {
    const parts = ['colorize', instructions.colorize.color.replace('#', '')];
    if (instructions.colorize.amount !== undefined) parts.push(String(instructions.colorize.amount));
    segments.push(parts.join('-'));
  }

  // vignette
  if (instructions.vignette) {
    const parts = ['vig'];
    if (instructions.vignette.scale !== undefined) parts.push(String(instructions.vignette.scale));
    if (instructions.vignette.opacity !== undefined) parts.push(String(instructions.vignette.opacity));
    segments.push(parts.join('-'));
  }

  // pixelate
  if (instructions.pixelate !== undefined) {
    const size = typeof instructions.pixelate === 'number' ? instructions.pixelate : (instructions.pixelate.size ?? 10);
    segments.push(`pix-${size}`);
  }

  // noise
  if (instructions.noise) {
    const parts = ['noise'];
    if (instructions.noise.type) parts.push(instructions.noise.type);
    if (instructions.noise.amount !== undefined) parts.push(String(instructions.noise.amount));
    segments.push(parts.join('-'));
  }

  // edge
  if (instructions.edge) {
    segments.push('edge');
  }

  // autoEnhance
  if (instructions.autoEnhance !== undefined) {
    const s = typeof instructions.autoEnhance === 'number' ? instructions.autoEnhance : (instructions.autoEnhance.strength ?? 0.5);
    segments.push(`enhance-${s}`);
  }

  // border
  if (instructions.border) {
    const b = instructions.border;
    const parts = ['border'];
    if (b.width !== undefined) parts.push(String(b.width));
    if (b.color) parts.push(b.color.replace('#', ''));
    segments.push(parts.join('-'));
  }

  // watermark
  if (instructions.watermark) {
    const w = instructions.watermark;
    const parts = ['wm'];
    if ('text' in w) parts.push(encodeURIComponent(w.text));
    else parts.push(w.image);
    if (w.opacity !== undefined) parts.push(String(w.opacity));
    segments.push(parts.join('-'));
  }

  // tiled watermark
  if (instructions.tiledWatermark) {
    const parts = ['twm', encodeURIComponent(instructions.tiledWatermark.text)];
    segments.push(parts.join('-'));
  }

  // composite
  if (instructions.composite) {
    const c = instructions.composite;
    const parts = ['comp', c.image];
    if (c.mode) parts.push(c.mode);
    segments.push(parts.join('-'));
  }

  // svg overlay
  if (instructions.svgOverlay) {
    const parts = ['svg', instructions.svgOverlay.data];
    segments.push(parts.join('-'));
  }

  // palette
  if (instructions.palette !== undefined) {
    const p = typeof instructions.palette === 'number' ? instructions.palette : (instructions.palette.count ?? 5);
    segments.push(`palette-${p}`);
  }

  // metadata strip
  if (instructions.metadataStrip) {
    segments.push('strip');
  }

  // placeholder
  if (instructions.placeholder !== undefined) {
    const size = typeof instructions.placeholder === 'number' ? instructions.placeholder : (instructions.placeholder.size ?? 32);
    segments.push(`lqip-${size}`);
  }

  // responsive
  if (instructions.responsive) {
    const r = instructions.responsive;
    const parts = ['resp', r.widths.join(',')];
    if (r.format) parts.push(r.format);
    segments.push(parts.join('-'));
  }

  return segments.join('/');
} 