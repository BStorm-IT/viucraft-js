# Changelog

All notable changes to the VIUCraft JavaScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-06-09

### Added
- `ViucraftClient.resolveEndpoint()` — fetches the account's current canonical URL config
  from `GET /api/v1/account` and applies it, so the client self-heals after a plan change.
  After a paid→free downgrade the server reports `subdomain: null` and the URL builder
  automatically switches from the (now-deactivated) subdomain URL to the shared
  `/free/acc_*` URL.
- `ViucraftClient.create(config)` — static async factory that constructs a client and
  resolves its endpoint before returning, guaranteeing the first URL uses the correct base.
- `AccountConfigResponse` type, exported from the package root.

### Changed
- `updateConfig()` now also accepts `subdomain`, `baseUrl`, and `accountId`. Pass
  `subdomain: null` (or `''`) to clear a subdomain and fall back to the free-tier URL form.

### Fixed
- A long-lived client that cached a `subdomain` at construction no longer keeps generating
  dead URLs after the customer's subdomain is deactivated — call `resolveEndpoint()` (or use
  `create()`) to pick up the change.

## [2.0.0] - 2026-03-20

### Breaking Changes
- Minimum Node.js version: 18+ (native fetch/FormData required)
- Removed `axios` and `form-data` runtime dependencies (zero deps)
- Removed `buildImageUrl()` (deprecated since v1.1)
- Removed `getImageInfo()` (no matching v2 API endpoint)
- Upload accepts `Blob | File` only (no `Buffer`)
- `ImageListResponse` uses nested `pagination` object

### Added
- 8 namespaced resource modules: images, batch, webhooks, presets, warmSets, analytics, usage, discovery
- 17 new ImageBuilder operations: gamma, tint, colorize, vignette, pixelate, noise, edge, autoEnhance, border, watermark, tiledWatermark, composite, svgOverlay, palette, metadataStrip, placeholder, responsive
- `ViucraftTimeoutError` for request timeout handling
- Dual CJS/ESM build via tsup
- `"exports"` field in package.json for proper module resolution
- `"sideEffects": false` for tree-shaking
- New output formats: avif, gif, tiff
- MIGRATION.md guide

### Changed
- HTTP layer: native `fetch` with `AbortController` replaces axios
- Upload uses native `FormData` (no form-data package)
- Build: tsup replaces raw tsc

### Deprecated
- `uploadImage()` — use `client.images.upload()`
- `deleteImage()` — use `client.images.delete()`
- `listImages()` — use `client.images.list()`

## [1.1.0] - 2026-01-29

### Added
- `ViucraftClient` class with full configuration options (apiKey, subdomain, baseUrl, accountId, timeout, retry, enforceHttps)
- `ImageBuilder` fluent API for chainable image transformations
- All image operations: resize, crop, smartCrop, rotate, flip, blur, sharpen, brightness, contrast, grayscale, invert, emboss, median, thumbnail
- `uploadImage()` method with multipart/form-data support for Node.js and browser
- `deleteImage()`, `getImageInfo()`, `listImages()` API methods
- Automatic retry with exponential backoff for HTTP 429 (rate limit) responses
- Rate limit information extraction from response headers
- `ViucraftError`, `ViucraftValidationError`, `ViucraftRateLimitError`, `ViucraftNetworkError` error classes
- Comprehensive input validation for all parameters
- Both standard and short URL format generation
- `getMaskedApiKey()` for safe API key logging
- `updateConfig()` for post-construction configuration changes
- Full TypeScript type definitions with JSDoc comments
- Support for free-tier URL format with accountId
- HTTPS enforcement warning for insecure connections

### Changed
- `buildImageUrl()` marked as deprecated in favor of the chainable `image()` API

## [1.0.0] - 2026-01-28

### Added
- Initial release
- Basic `ViucraftClient` with upload and URL building
- Simple `ImageBuilder` with core operations
- TypeScript support
