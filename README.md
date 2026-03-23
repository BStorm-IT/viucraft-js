# Viucraft JavaScript SDK

A JavaScript SDK for integrating with the Viucraft image processing service.

## Installation

```bash
npm install viucraft
```

Or using yarn:

```bash
yarn add viucraft
```

## Basic Usage

```javascript
import { ViucraftClient } from 'viucraft';

// Initialize client with your API key
const client = new ViucraftClient({
  apiKey: 'your-api-key-here',
  // For paid plans with custom domain
  subdomain: 'your-subdomain', // Optional, for paid plans
});

// Upload an image
const uploadResult = await client.uploadImage(fileObject);
const imageId = uploadResult.image_id;
```

## Configuration

The client supports several configuration options:

```javascript
const client = new ViucraftClient({
  apiKey: 'your-api-key-here',
  subdomain: 'your-subdomain',   // Optional, for paid plans
  baseUrl: 'https://api.viucraft.com', // Optional, custom API URL
  accountId: 'acc_123',           // Optional, for free plans
  timeout: 30000,                 // Optional, request timeout in ms (default: 30000)
  enforceHttps: true,             // Optional, warn on HTTP URLs (default: true)
  retry: {                        // Optional, retry config for 429 responses
    maxRetries: 3,                // Max retry attempts (default: 3)
    initialDelayMs: 1000,         // Initial backoff delay (default: 1000)
    maxDelayMs: 30000,            // Maximum backoff delay (default: 30000)
    backoffMultiplier: 2,         // Exponential backoff multiplier (default: 2)
  },
  // retry: false,                // Set to false to disable retries
});
```

You can also update certain config values after construction:

```javascript
client.updateConfig({ apiKey: 'new-api-key' });
client.updateConfig({ timeout: 5000 });
```

## Chainable API (Recommended)

The SDK supports a chainable API for creating image URLs with transformations:

```javascript
// Create a resized image URL
const resizedUrl = client.image(imageId)
  .resize(300, 200)
  .toURL();

// Create a complex transformation with multiple operations
const complexUrl = client.image(imageId)
  .resize(500, 300)
  .brightness(1.2)
  .contrast(1.1)
  .sharpen(0.8)
  .grayscale()
  .setFormat('webp')
  .toURL();

// Create a thumbnail with cropping strategy
const thumbnailUrl = client.image(imageId)
  .thumbnail(150, 150, 'entropy')
  .toURL();
```

### Chainable Methods

- `.resize(width, height, [scale])` - Resize an image
- `.crop(left, top, width, height)` - Crop an image
- `.rotate(angle, [background])` - Rotate an image
- `.brightness(factor)` - Adjust brightness (0-10)
- `.contrast(factor)` - Adjust contrast (0-10)
- `.grayscale()` - Convert to grayscale
- `.invert()` - Invert colors
- `.blur([sigma])` - Apply blur effect
- `.sharpen([sigma])` - Sharpen the image
- `.emboss()` - Apply emboss effect
- `.median([size])` - Apply median filter
- `.thumbnail(width, height, [crop])` - Create a thumbnail
- `.smartCrop(width, height)` - Apply smart cropping
- `.flip(direction)` - Flip image ('horizontal', 'vertical', 'h', 'v')
- `.quality(value)` - Set output quality (1-100)
- `.setFormat(format)` - Set output format ('jpg', 'png', 'webp')
- `.useShort([boolean])` - Use short URL format
- `.getInstructions()` - Get a copy of current processing instructions
- `.toURL()` - Generate the final URL

## Error Handling

The SDK uses a custom error hierarchy for structured error handling:

```javascript
import {
  ViucraftError,
  ViucraftValidationError,
  ViucraftRateLimitError,
  ViucraftNetworkError,
} from 'viucraft';

try {
  const result = await client.uploadImage(file);
} catch (error) {
  if (error instanceof ViucraftRateLimitError) {
    // Rate limited - retryAfter tells you how long to wait
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
    console.log('Rate limit info:', error.rateLimit);
  } else if (error instanceof ViucraftValidationError) {
    // Client-side validation failure
    console.log(`Invalid parameter: ${error.parameterName}`);
  } else if (error instanceof ViucraftNetworkError) {
    // Connection failure or timeout
    console.log('Network error:', error.message);
  } else if (error instanceof ViucraftError) {
    // General API error
    console.log(`API error ${error.status}: ${error.message}`);
    console.log('Error code:', error.code);
  }
}
```

All error classes extend `ViucraftError`, which extends `Error`:
- **`ViucraftError`** - Base class with `code`, `status`, `rateLimit`, `responseData`
- **`ViucraftValidationError`** - Client-side validation errors with `parameterName`
- **`ViucraftRateLimitError`** - HTTP 429 errors with `retryAfter` (seconds)
- **`ViucraftNetworkError`** - Connection/timeout failures

## Rate Limiting

The SDK automatically retries requests that receive HTTP 429 (Too Many Requests) responses using exponential backoff. When available, it respects the `Retry-After` and `X-RateLimit-Reset` response headers.

Default retry behavior: up to 3 retries with 1s initial delay and 2x backoff multiplier. Configure or disable via the `retry` option:

```javascript
// Custom retry config
const client = new ViucraftClient({
  apiKey: 'your-key',
  retry: { maxRetries: 5, initialDelayMs: 500 },
});

// Disable retries
const client = new ViucraftClient({
  apiKey: 'your-key',
  retry: false,
});
```

## Legacy API (Deprecated)

The SDK still supports the legacy API for backward compatibility:

```javascript
// Create an image URL with processing instructions
const imageUrl = client.buildImageUrl(imageId, {
  resize: { width: 300, height: 200 },
  grayscale: true,
  brightness: 1.2
});

// Or use the short format
const thumbnailUrl = client.buildImageUrl(imageId, 'thumb-300-200');
```

## Other Operations

```javascript
// Delete an image
const deleteResult = await client.deleteImage(imageId);

// Get image information
const imageInfo = await client.getImageInfo(imageId);

// List images (paginated)
const imagesList = await client.listImages(1, 20);
```

## Available Image Operations

The SDK supports all image operations available in the Viucraft API:

- Resize - Resize an image to specific dimensions
- Crop - Crop an image at specific coordinates
- Rotate - Rotate an image by a specified angle
- Brightness - Adjust image brightness
- Contrast - Adjust image contrast
- Grayscale - Convert image to grayscale
- Thumbnail - Create a thumbnail with intelligent resizing
- SmartCrop - Intelligent cropping that preserves important parts of the image
- Blur - Apply Gaussian blur
- Sharpen - Sharpen the image
- Invert - Invert the image colors
- Emboss - Apply emboss effect
- Median - Apply median filter for noise reduction
- Flip - Flip image horizontally or vertically
- Quality - Set output quality (1-100)

## Security Notes

- **Never embed API keys in client-side (browser) code.** API keys should only be used in server-side environments. For browser usage, proxy requests through your backend.
- The SDK warns when using HTTP instead of HTTPS, since API keys sent over HTTP can be intercepted.
- Use `getMaskedApiKey()` for safe logging: `client.getMaskedApiKey()` returns `abcd****efgh`.

## Migration from 1.0

### Breaking Changes

- **`uploadImage()` now throws on error** instead of returning `{ status: 'error', error_message: '...' }`. Wrap calls in try/catch.
- **`deleteImage()` now throws on error** instead of returning `{ success: false, message: '...' }`.

### Before (1.0):

```javascript
const result = await client.uploadImage(file);
if (result.status === 'error') {
  console.error(result.error_message);
}
```

### After (1.1):

```javascript
try {
  const result = await client.uploadImage(file);
  // result.status is always 'success' here
} catch (error) {
  if (error instanceof ViucraftError) {
    console.error(error.message);
  }
}
```

## Examples

### Basic Example

```javascript
// Upload an image and create a thumbnail
try {
  const uploadResult = await client.uploadImage(fileObject);
  if (uploadResult.image_id) {
    const thumbnailUrl = client.image(uploadResult.image_id)
      .thumbnail(200, 200, 'entropy')
      .grayscale()
      .toURL();

    // Use the thumbnail URL in your application
    document.getElementById('preview').src = thumbnailUrl;
  }
} catch (error) {
  console.error('Upload failed:', error.message);
}
```

### Advanced Example

```javascript
// Create a complex image processing chain
const processedImageUrl = client.image(imageId)
  .resize(800, 600)
  .brightness(1.1)
  .contrast(1.2)
  .sharpen(0.7)
  .quality(90)
  .setFormat('webp')
  .toURL();

// The URL can be used directly in img tags
const img = document.createElement('img');
img.src = processedImageUrl;
document.body.appendChild(img);
```

## Documentation

For detailed documentation and examples, see the [API Reference](https://viucraft.com/docs).

## License

MIT
