import { ViucraftValidationError } from './errors';

/** Maximum image dimension in pixels */
export const MAX_DIMENSION = 16384;

/** Maximum blur sigma value */
export const MAX_BLUR_SIGMA = 100;

/** Maximum median filter size */
export const MAX_MEDIAN_SIZE = 99;

/**
 * Validates that a value is a positive integer.
 * Used for image dimensions (width, height).
 */
export function validatePositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ViucraftValidationError(
      `${name} must be a positive integer, got ${value}`,
      name
    );
  }
}

/**
 * Validates that a value is a non-negative integer.
 * Used for crop offsets (left, top).
 */
export function validateNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new ViucraftValidationError(
      `${name} must be a non-negative integer, got ${value}`,
      name
    );
  }
}

/**
 * Validates that a value is within a given range (inclusive).
 * Used for brightness/contrast (0-10) and quality (1-100).
 */
export function validateRange(name: string, value: number, min: number, max: number): void {
  if (typeof value !== 'number' || !isFinite(value) || value < min || value > max) {
    throw new ViucraftValidationError(
      `${name} must be between ${min} and ${max}, got ${value}`,
      name
    );
  }
}

/**
 * Validates that a value is a positive number (not necessarily integer).
 * Used for blur/sharpen sigma, scale factor.
 */
export function validatePositiveNumber(name: string, value: number): void {
  if (typeof value !== 'number' || !isFinite(value) || value <= 0) {
    throw new ViucraftValidationError(
      `${name} must be a positive number, got ${value}`,
      name
    );
  }
}

/**
 * Validates a hex color string (with or without leading #).
 * Accepts 3 or 6 hex characters.
 */
export function validateHexColor(name: string, value: string): void {
  const hex = value.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)) {
    throw new ViucraftValidationError(
      `${name} must be a valid hex color (e.g. "#ff0000" or "ff0000"), got "${value}"`,
      name
    );
  }
}

/**
 * Validates that an API key is a non-empty string.
 */
export function validateApiKey(value: unknown): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ViucraftValidationError(
      'apiKey must be a non-empty string',
      'apiKey'
    );
  }
}

/**
 * Validates that an image ID is a non-empty string.
 */
export function validateImageId(value: unknown): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ViucraftValidationError(
      'imageId must be a non-empty string',
      'imageId'
    );
  }
}

/**
 * Validates that a value is a non-empty string.
 */
export function validateNonEmptyString(name: string, value: unknown): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ViucraftValidationError(
      `${name} must be a non-empty string`,
      name
    );
  }
}

/**
 * Validates a strict 6-character hex color string (with or without leading #).
 */
export function validateHex6Color(name: string, value: string): void {
  const hex = value.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    throw new ViucraftValidationError(
      `${name} must be a valid 6-digit hex color (e.g. "#ff0000" or "ff0000"), got "${value}"`,
      name
    );
  }
}

/**
 * Validates that a value is an integer within a given range (inclusive).
 */
export function validateIntegerRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ViucraftValidationError(
      `${name} must be an integer between ${min} and ${max}, got ${value}`,
      name
    );
  }
}

/**
 * Validates that a value is a non-negative number.
 */
export function validateNonNegativeNumber(name: string, value: number): void {
  if (typeof value !== 'number' || !isFinite(value) || value < 0) {
    throw new ViucraftValidationError(
      `${name} must be a non-negative number, got ${value}`,
      name
    );
  }
}

/**
 * Validates that a value is one of a set of allowed values.
 */
export function validateOneOf<T>(name: string, value: T, allowed: readonly T[]): void {
  if (!allowed.includes(value)) {
    throw new ViucraftValidationError(
      `${name} must be one of ${allowed.join(', ')}, got "${value}"`,
      name
    );
  }
}

// ─── Range constants for v2.0 operation parameters ──────────────────────────

/** Maximum gamma value */
export const MAX_GAMMA = 10.0;
/** Minimum gamma value */
export const MIN_GAMMA = 0.1;
/** Maximum pixelate size */
export const MAX_PIXELATE_SIZE = 100;
/** Minimum pixelate size */
export const MIN_PIXELATE_SIZE = 2;
/** Maximum border width */
export const MAX_BORDER_WIDTH = 200;
/** Maximum border radius */
export const MAX_BORDER_RADIUS = 500;
/** Maximum shadow blur */
export const MAX_SHADOW_BLUR = 50;
/** Maximum watermark text size */
export const MAX_WATERMARK_SIZE = 200;
/** Minimum watermark text size */
export const MIN_WATERMARK_SIZE = 8;
/** Maximum palette count */
export const MAX_PALETTE_COUNT = 10;
/** Minimum palette count */
export const MIN_PALETTE_COUNT = 3;
/** Maximum placeholder size */
export const MAX_PLACEHOLDER_SIZE = 128;
/** Minimum placeholder size */
export const MIN_PLACEHOLDER_SIZE = 8;
/** Maximum SVG overlay scale */
export const MAX_SVG_SCALE = 5.0;
/** Minimum SVG overlay scale */
export const MIN_SVG_SCALE = 0.1;

/** Valid noise types */
export const VALID_NOISE_TYPES = ['gaussian', 'salt', 'pepper', 'salt-pepper'] as const;

/** Valid watermark positions */
export const VALID_WATERMARK_POSITIONS = [
  'top-left', 'tc', 'top-right',
  'ml', 'mc', 'mr',
  'bottom-left', 'bc', 'bottom-right',
] as const;

/** Valid composite blend modes */
export const VALID_COMPOSITE_MODES = [
  'over', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'colour-dodge', 'colour-burn', 'hard-light', 'soft-light', 'difference', 'exclusion',
] as const;
