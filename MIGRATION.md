# Migrating from v1.x to v2.0

## Breaking Changes

### Node.js 18+ Required

v2.0 uses native `fetch`, `FormData`, and `AbortController` which require Node.js 18+.

### axios and form-data Removed

v2.0 has **zero runtime dependencies**. If your project depends on axios separately, it is unaffected.

### `buildImageUrl()` Removed

This method was deprecated in v1.1. Use the chainable `image()` builder instead:

```typescript
// Before (v1.x)
const url = client.buildImageUrl('uuid', { resize: { width: 800, height: 600 } }, 'webp');

// After (v2.0)
const url = client.image('uuid').resize(800, 600).setFormat('webp').toURL();
```

### `getImageInfo()` Removed

The single-image info endpoint is no longer available. Use `client.images.list()` with a search query:

```typescript
// Before (v1.x)
const info = await client.getImageInfo('uuid');

// After (v2.0)
const result = await client.images.list({ q: 'uuid' });
```

### Upload Type Signature Changed

v2.0 accepts `Blob | File` only (no `Buffer`). Node.js users with a Buffer:

```typescript
// Before (v1.x)
await client.uploadImage(buffer);

// After (v2.0)
await client.images.upload(new Blob([buffer]));
```

### Upload Field Name Changed

The server endpoint changed from `/upload` (field: `image`) to `/api/v1/cli/images/upload` (field: `file`). This is handled automatically by the SDK.

### `listImages()` Response Shape

The response wrapper changed from flat pagination to nested `pagination` object:

```typescript
// v1 response: { images: [], total: 100, page: 1, limit: 20 }
// v2 response: { images: [], pagination: { total: 100, page: 1, limit: 20 } }
```

The deprecated `client.listImages()` method still returns the v1 flat shape for backward compatibility.

## New Features

### Namespaced Resource Modules

All API operations are now organized by resource:

```typescript
// Images
await client.images.upload(file);
await client.images.list({ page: 1, limit: 20 });
await client.images.delete('uuid');
await client.images.transform('uuid', 'resize_width_800');

// Batch Jobs
await client.batch.create([{ image_id: 'uuid', operations: 'resize_width_800' }]);
await client.batch.list();
await client.batch.get('job-id');
await client.batch.cancel('job-id');

// Webhooks
await client.webhooks.list();
await client.webhooks.create('https://example.com/hook', ['image.processed']);

// Presets
await client.presets.list();
await client.presets.create('thumbnail', ['resize_width_200_height_200']);

// Warm Sets
await client.warmSets.list();
await client.warmSets.create('mobile', 'resize_width_640', { format: 'webp' });

// Analytics
await client.analytics.metadata('uuid');
await client.analytics.colors('uuid', 5);
await client.analytics.quality('uuid');

// Usage
await client.usage.current();
await client.usage.daily({ start_date: '2026-01-01', end_date: '2026-01-31' });

// Discovery
await client.discovery.capabilities();
```

### 17 New Image Operations

```typescript
client.image('uuid')
  .gamma(2.2)
  .tint('FFFFFF', '000000')
  .colorize('FF6600', 0.8)
  .vignette(0.3, 0.7)
  .pixelate(10)
  .noise('gaussian', 0.2)
  .edge()
  .autoEnhance(0.5)
  .border({ width: 10, color: '000000' })
  .watermark({ text: 'Logo', opacity: 0.5 })
  .tiledWatermark('Draft', { opacity: 30 })
  .composite('overlay-uuid', { mode: 'multiply' })
  .svgOverlay(svgData, { scale: 2.0 })
  .palette(5)
  .metadataStrip()
  .placeholder(32)
  .responsive([320, 640, 1024], 'webp')
  .toURL();
```

### New Output Formats

`setFormat()` now accepts: `'avif'`, `'gif'`, `'tiff'` in addition to `'jpg'`, `'jpeg'`, `'png'`, `'webp'`.

### ViucraftTimeoutError

New error class for request timeouts:

```typescript
try {
  await client.images.list();
} catch (error) {
  if (error instanceof ViucraftTimeoutError) {
    console.log(`Timed out after ${error.timeoutMs}ms`);
  }
}
```

### Dual CJS/ESM Output

v2.0 ships both CommonJS and ES Module builds:

```typescript
// ESM
import { ViucraftClient } from 'viucraft';

// CJS
const { ViucraftClient } = require('viucraft');
```

## Deprecated Methods

These methods still work in v2.0 but will be removed in v3.0:

| Deprecated | Replacement |
|-----------|-------------|
| `client.uploadImage(file)` | `client.images.upload(file)` |
| `client.deleteImage(id)` | `client.images.delete(id)` |
| `client.listImages(page, limit)` | `client.images.list({ page, limit })` |
