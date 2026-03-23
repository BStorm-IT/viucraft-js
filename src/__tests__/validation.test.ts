import {
  validatePositiveInteger,
  validateNonNegativeInteger,
  validateRange,
  validatePositiveNumber,
  validateHexColor,
  validateApiKey,
  validateImageId,
  validateOneOf,
  validateHex6Color,
  validateNonNegativeNumber,
  validateNonEmptyString,
  validateIntegerRange,
  MAX_DIMENSION,
  MAX_BLUR_SIGMA,
  MAX_MEDIAN_SIZE,
  MAX_GAMMA,
  MIN_GAMMA,
  MAX_PIXELATE_SIZE,
  MIN_PIXELATE_SIZE,
  MAX_BORDER_WIDTH,
  MAX_BORDER_RADIUS,
  MAX_SHADOW_BLUR,
  MAX_WATERMARK_SIZE,
  MIN_WATERMARK_SIZE,
  MAX_PALETTE_COUNT,
  MIN_PALETTE_COUNT,
  MAX_PLACEHOLDER_SIZE,
  MIN_PLACEHOLDER_SIZE,
  MAX_SVG_SCALE,
  MIN_SVG_SCALE,
  VALID_NOISE_TYPES,
  VALID_WATERMARK_POSITIONS,
  VALID_COMPOSITE_MODES,
} from '../validation';
import { ViucraftValidationError } from '../errors';

describe('validatePositiveInteger', () => {
  it('should accept positive integers', () => {
    expect(() => validatePositiveInteger('width', 1)).not.toThrow();
    expect(() => validatePositiveInteger('width', 100)).not.toThrow();
    expect(() => validatePositiveInteger('width', 16384)).not.toThrow();
  });

  it('should reject zero', () => {
    expect(() => validatePositiveInteger('width', 0)).toThrow(ViucraftValidationError);
  });

  it('should reject negative numbers', () => {
    expect(() => validatePositiveInteger('width', -1)).toThrow(ViucraftValidationError);
  });

  it('should reject non-integers', () => {
    expect(() => validatePositiveInteger('width', 1.5)).toThrow(ViucraftValidationError);
    expect(() => validatePositiveInteger('width', NaN)).toThrow(ViucraftValidationError);
    expect(() => validatePositiveInteger('width', Infinity)).toThrow(ViucraftValidationError);
  });

  it('should include parameter name in error', () => {
    try {
      validatePositiveInteger('width', -1);
    } catch (e) {
      expect(e).toBeInstanceOf(ViucraftValidationError);
      expect((e as ViucraftValidationError).parameterName).toBe('width');
    }
  });
});

describe('validateNonNegativeInteger', () => {
  it('should accept zero', () => {
    expect(() => validateNonNegativeInteger('left', 0)).not.toThrow();
  });

  it('should accept positive integers', () => {
    expect(() => validateNonNegativeInteger('left', 1)).not.toThrow();
    expect(() => validateNonNegativeInteger('top', 100)).not.toThrow();
  });

  it('should reject negative numbers', () => {
    expect(() => validateNonNegativeInteger('left', -1)).toThrow(ViucraftValidationError);
  });

  it('should reject non-integers', () => {
    expect(() => validateNonNegativeInteger('top', 1.5)).toThrow(ViucraftValidationError);
  });
});

describe('validateRange', () => {
  it('should accept values within range', () => {
    expect(() => validateRange('brightness', 0, 0, 10)).not.toThrow();
    expect(() => validateRange('brightness', 5, 0, 10)).not.toThrow();
    expect(() => validateRange('brightness', 10, 0, 10)).not.toThrow();
  });

  it('should accept boundary values', () => {
    expect(() => validateRange('quality', 1, 1, 100)).not.toThrow();
    expect(() => validateRange('quality', 100, 1, 100)).not.toThrow();
  });

  it('should reject values below range', () => {
    expect(() => validateRange('quality', 0, 1, 100)).toThrow(ViucraftValidationError);
  });

  it('should reject values above range', () => {
    expect(() => validateRange('quality', 101, 1, 100)).toThrow(ViucraftValidationError);
  });

  it('should reject NaN and Infinity', () => {
    expect(() => validateRange('brightness', NaN, 0, 10)).toThrow(ViucraftValidationError);
    expect(() => validateRange('brightness', Infinity, 0, 10)).toThrow(ViucraftValidationError);
    expect(() => validateRange('brightness', -Infinity, 0, 10)).toThrow(ViucraftValidationError);
  });
});

describe('validatePositiveNumber', () => {
  it('should accept positive numbers', () => {
    expect(() => validatePositiveNumber('sigma', 0.01)).not.toThrow();
    expect(() => validatePositiveNumber('sigma', 1.0)).not.toThrow();
    expect(() => validatePositiveNumber('sigma', 99.9)).not.toThrow();
  });

  it('should reject zero', () => {
    expect(() => validatePositiveNumber('sigma', 0)).toThrow(ViucraftValidationError);
  });

  it('should reject negative numbers', () => {
    expect(() => validatePositiveNumber('sigma', -0.1)).toThrow(ViucraftValidationError);
  });

  it('should reject NaN and Infinity', () => {
    expect(() => validatePositiveNumber('sigma', NaN)).toThrow(ViucraftValidationError);
    expect(() => validatePositiveNumber('sigma', Infinity)).toThrow(ViucraftValidationError);
  });
});

describe('validateHexColor', () => {
  it('should accept valid 6-digit hex colors', () => {
    expect(() => validateHexColor('bg', '#ff0000')).not.toThrow();
    expect(() => validateHexColor('bg', 'ff0000')).not.toThrow();
    expect(() => validateHexColor('bg', '#ABCDEF')).not.toThrow();
    expect(() => validateHexColor('bg', '000000')).not.toThrow();
  });

  it('should accept valid 3-digit hex colors', () => {
    expect(() => validateHexColor('bg', '#fff')).not.toThrow();
    expect(() => validateHexColor('bg', 'abc')).not.toThrow();
  });

  it('should reject invalid hex colors', () => {
    expect(() => validateHexColor('bg', 'xyz')).toThrow(ViucraftValidationError);
    expect(() => validateHexColor('bg', '#gggggg')).toThrow(ViucraftValidationError);
    expect(() => validateHexColor('bg', '12345')).toThrow(ViucraftValidationError);
    expect(() => validateHexColor('bg', '')).toThrow(ViucraftValidationError);
  });
});

describe('validateApiKey', () => {
  it('should accept non-empty strings', () => {
    expect(() => validateApiKey('abc123')).not.toThrow();
    expect(() => validateApiKey('sk-test-key')).not.toThrow();
  });

  it('should reject empty strings', () => {
    expect(() => validateApiKey('')).toThrow(ViucraftValidationError);
    expect(() => validateApiKey('   ')).toThrow(ViucraftValidationError);
  });

  it('should reject non-string values', () => {
    expect(() => validateApiKey(undefined)).toThrow(ViucraftValidationError);
    expect(() => validateApiKey(null)).toThrow(ViucraftValidationError);
    expect(() => validateApiKey(123)).toThrow(ViucraftValidationError);
  });
});

describe('validateImageId', () => {
  it('should accept non-empty strings', () => {
    expect(() => validateImageId('abc-123-def')).not.toThrow();
    expect(() => validateImageId('img001')).not.toThrow();
  });

  it('should reject empty strings', () => {
    expect(() => validateImageId('')).toThrow(ViucraftValidationError);
    expect(() => validateImageId('  ')).toThrow(ViucraftValidationError);
  });

  it('should reject non-string values', () => {
    expect(() => validateImageId(undefined)).toThrow(ViucraftValidationError);
    expect(() => validateImageId(null)).toThrow(ViucraftValidationError);
  });
});

describe('constants', () => {
  it('should export correct constants', () => {
    expect(MAX_DIMENSION).toBe(16384);
    expect(MAX_BLUR_SIGMA).toBe(100);
    expect(MAX_MEDIAN_SIZE).toBe(99);
  });
});

// ─── Tests for new v2.0 validators ──────────────────────────────────────────

describe('validateOneOf', () => {
  const colors = ['red', 'green', 'blue'] as const;

  it('should accept a valid value', () => {
    expect(() => validateOneOf('color', 'red', colors)).not.toThrow();
    expect(() => validateOneOf('color', 'blue', colors)).not.toThrow();
  });

  it('should reject an invalid value', () => {
    expect(() => validateOneOf('color', 'yellow' as 'red', colors)).toThrow(ViucraftValidationError);
  });

  it('should include parameter name in error', () => {
    try {
      validateOneOf('blendMode', 'invalid' as 'over', ['over', 'multiply'] as const);
    } catch (e) {
      expect(e).toBeInstanceOf(ViucraftValidationError);
      expect((e as ViucraftValidationError).parameterName).toBe('blendMode');
    }
  });

  it('should work with VALID_NOISE_TYPES', () => {
    expect(() => validateOneOf('type', 'gaussian', VALID_NOISE_TYPES)).not.toThrow();
    expect(() => validateOneOf('type', 'salt-pepper', VALID_NOISE_TYPES)).not.toThrow();
  });

  it('should work with VALID_WATERMARK_POSITIONS', () => {
    expect(() => validateOneOf('position', 'top-left', VALID_WATERMARK_POSITIONS)).not.toThrow();
    expect(() => validateOneOf('position', 'mc', VALID_WATERMARK_POSITIONS)).not.toThrow();
  });

  it('should work with VALID_COMPOSITE_MODES', () => {
    expect(() => validateOneOf('mode', 'over', VALID_COMPOSITE_MODES)).not.toThrow();
    expect(() => validateOneOf('mode', 'multiply', VALID_COMPOSITE_MODES)).not.toThrow();
  });
});

describe('validateHex6Color', () => {
  it('should accept valid 6-digit hex colors', () => {
    expect(() => validateHex6Color('color', '#FF6600')).not.toThrow();
    expect(() => validateHex6Color('color', 'FF6600')).not.toThrow();
    expect(() => validateHex6Color('color', '#000000')).not.toThrow();
    expect(() => validateHex6Color('color', 'abcdef')).not.toThrow();
  });

  it('should reject 3-digit hex colors (not strict 6-char)', () => {
    expect(() => validateHex6Color('color', '#fff')).toThrow(ViucraftValidationError);
    expect(() => validateHex6Color('color', 'abc')).toThrow(ViucraftValidationError);
  });

  it('should reject invalid hex strings', () => {
    expect(() => validateHex6Color('color', '#ZZZZZZ')).toThrow(ViucraftValidationError);
    expect(() => validateHex6Color('color', 'gggggg')).toThrow(ViucraftValidationError);
    expect(() => validateHex6Color('color', '')).toThrow(ViucraftValidationError);
    expect(() => validateHex6Color('color', '12345')).toThrow(ViucraftValidationError);
  });

  it('should include parameter name in error', () => {
    try {
      validateHex6Color('borderColor', 'invalid');
    } catch (e) {
      expect(e).toBeInstanceOf(ViucraftValidationError);
      expect((e as ViucraftValidationError).parameterName).toBe('borderColor');
    }
  });
});

describe('validateNonNegativeNumber', () => {
  it('should accept zero', () => {
    expect(() => validateNonNegativeNumber('opacity', 0)).not.toThrow();
  });

  it('should accept positive numbers (including floats)', () => {
    expect(() => validateNonNegativeNumber('opacity', 0.5)).not.toThrow();
    expect(() => validateNonNegativeNumber('opacity', 1.0)).not.toThrow();
    expect(() => validateNonNegativeNumber('scale', 2.5)).not.toThrow();
  });

  it('should reject negative numbers', () => {
    expect(() => validateNonNegativeNumber('opacity', -0.1)).toThrow(ViucraftValidationError);
    expect(() => validateNonNegativeNumber('opacity', -1)).toThrow(ViucraftValidationError);
  });

  it('should reject NaN and Infinity', () => {
    expect(() => validateNonNegativeNumber('opacity', NaN)).toThrow(ViucraftValidationError);
    expect(() => validateNonNegativeNumber('opacity', Infinity)).toThrow(ViucraftValidationError);
  });

  it('should include parameter name in error', () => {
    try {
      validateNonNegativeNumber('shadowX', -5);
    } catch (e) {
      expect(e).toBeInstanceOf(ViucraftValidationError);
      expect((e as ViucraftValidationError).parameterName).toBe('shadowX');
    }
  });
});

describe('validateNonEmptyString', () => {
  it('should accept non-empty strings', () => {
    expect(() => validateNonEmptyString('text', 'hello')).not.toThrow();
    expect(() => validateNonEmptyString('text', 'Watermark text')).not.toThrow();
  });

  it('should reject empty strings', () => {
    expect(() => validateNonEmptyString('text', '')).toThrow(ViucraftValidationError);
    expect(() => validateNonEmptyString('text', '   ')).toThrow(ViucraftValidationError);
  });

  it('should reject non-string values', () => {
    expect(() => validateNonEmptyString('text', undefined)).toThrow(ViucraftValidationError);
    expect(() => validateNonEmptyString('text', null)).toThrow(ViucraftValidationError);
    expect(() => validateNonEmptyString('text', 123)).toThrow(ViucraftValidationError);
  });

  it('should include parameter name in error', () => {
    try {
      validateNonEmptyString('watermarkText', '');
    } catch (e) {
      expect(e).toBeInstanceOf(ViucraftValidationError);
      expect((e as ViucraftValidationError).parameterName).toBe('watermarkText');
    }
  });
});

describe('validateIntegerRange', () => {
  it('should accept integers within range (inclusive boundaries)', () => {
    expect(() => validateIntegerRange('count', 3, 3, 10)).not.toThrow();
    expect(() => validateIntegerRange('count', 5, 3, 10)).not.toThrow();
    expect(() => validateIntegerRange('count', 10, 3, 10)).not.toThrow();
  });

  it('should reject integers below range', () => {
    expect(() => validateIntegerRange('count', 2, 3, 10)).toThrow(ViucraftValidationError);
    expect(() => validateIntegerRange('size', 1, 2, 100)).toThrow(ViucraftValidationError);
  });

  it('should reject integers above range', () => {
    expect(() => validateIntegerRange('count', 11, 3, 10)).toThrow(ViucraftValidationError);
  });

  it('should reject non-integers', () => {
    expect(() => validateIntegerRange('size', 5.5, 2, 100)).toThrow(ViucraftValidationError);
    expect(() => validateIntegerRange('size', NaN, 2, 100)).toThrow(ViucraftValidationError);
  });

  it('should include parameter name in error', () => {
    try {
      validateIntegerRange('paletteCount', 1, MIN_PALETTE_COUNT, MAX_PALETTE_COUNT);
    } catch (e) {
      expect(e).toBeInstanceOf(ViucraftValidationError);
      expect((e as ViucraftValidationError).parameterName).toBe('paletteCount');
    }
  });
});

describe('v2.0 range constants', () => {
  it('should export correct gamma constants', () => {
    expect(MAX_GAMMA).toBe(10.0);
    expect(MIN_GAMMA).toBe(0.1);
  });

  it('should export correct pixelate constants', () => {
    expect(MAX_PIXELATE_SIZE).toBe(100);
    expect(MIN_PIXELATE_SIZE).toBe(2);
  });

  it('should export correct border constants', () => {
    expect(MAX_BORDER_WIDTH).toBe(200);
    expect(MAX_BORDER_RADIUS).toBe(500);
    expect(MAX_SHADOW_BLUR).toBe(50);
  });

  it('should export correct watermark constants', () => {
    expect(MAX_WATERMARK_SIZE).toBe(200);
    expect(MIN_WATERMARK_SIZE).toBe(8);
  });

  it('should export correct palette constants', () => {
    expect(MAX_PALETTE_COUNT).toBe(10);
    expect(MIN_PALETTE_COUNT).toBe(3);
  });

  it('should export correct placeholder constants', () => {
    expect(MAX_PLACEHOLDER_SIZE).toBe(128);
    expect(MIN_PLACEHOLDER_SIZE).toBe(8);
  });

  it('should export correct SVG scale constants', () => {
    expect(MAX_SVG_SCALE).toBe(5.0);
    expect(MIN_SVG_SCALE).toBe(0.1);
  });

  it('should export valid noise types', () => {
    expect(VALID_NOISE_TYPES).toContain('gaussian');
    expect(VALID_NOISE_TYPES).toContain('salt');
    expect(VALID_NOISE_TYPES).toContain('pepper');
    expect(VALID_NOISE_TYPES).toContain('salt-pepper');
  });

  it('should export valid watermark positions', () => {
    expect(VALID_WATERMARK_POSITIONS).toContain('top-left');
    expect(VALID_WATERMARK_POSITIONS).toContain('mc');
    expect(VALID_WATERMARK_POSITIONS).toContain('bottom-right');
  });

  it('should export valid composite modes', () => {
    expect(VALID_COMPOSITE_MODES).toContain('over');
    expect(VALID_COMPOSITE_MODES).toContain('multiply');
    expect(VALID_COMPOSITE_MODES).toContain('exclusion');
  });
});
