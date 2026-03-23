// Example usage of the Viucraft SDK
import { ViucraftClient } from './ViucraftClient';

// Initialize the client
const client = new ViucraftClient({
  apiKey: 'your-api-key-here',
  // For paid plans with custom domain
  subdomain: 'your-subdomain',
  // For free plans
  // accountId: 'acc_123',
});

// Example: Upload an image
async function uploadExample(file: File) {
  try {
    const result = await client.uploadImage(file);
    if (result.status === 'success' && result.image_id) {
      console.log('Image uploaded successfully. ID:', result.image_id);
      return result.image_id;
    } else {
      console.error('Failed to upload image:', result.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Example: Generate image URLs using the new chainable API
function generateChainableImageUrls(imageId: string) {
  // Resize to 300x200
  const resizedUrl = client.image(imageId)
    .resize(300, 200)
    .toURL();
  console.log('Resized image URL:', resizedUrl);

  // Crop to 100x100 from position 50,50
  const croppedUrl = client.image(imageId)
    .crop(50, 50, 100, 100)
    .toURL();
  console.log('Cropped image URL:', croppedUrl);

  // Create a grayscale thumbnail
  const thumbnailUrl = client.image(imageId)
    .thumbnail(150, 150)
    .grayscale()
    .toURL();
  console.log('Grayscale thumbnail URL:', thumbnailUrl);

  // Output as WebP format with short URL syntax
  const webpUrl = client.image(imageId)
    .thumbnail(300, 200)
    .grayscale()
    .setFormat('webp')
    .useShort()
    .toURL();
  console.log('WebP with short format URL:', webpUrl);

  // Apply multiple transformations in a chain
  const complexUrl = client.image(imageId)
    .resize(500, 300)
    .brightness(1.2)
    .contrast(1.1)
    .sharpen(0.8)
    .toURL();
  console.log('Complex transformations URL:', complexUrl);
  
  // Rotate example
  const rotatedUrl = client.image(imageId)
    .rotate(90, "#ffffff")
    .toURL();
  console.log('Rotated image URL:', rotatedUrl);
  
  // Blur and invert example
  const blurInvertUrl = client.image(imageId)
    .blur(2.5)
    .invert()
    .toURL();
  console.log('Blur and invert URL:', blurInvertUrl);

  return {
    resizedUrl,
    croppedUrl,
    thumbnailUrl,
    webpUrl,
    complexUrl,
    rotatedUrl,
    blurInvertUrl
  };
}

// Example using the deprecated method (for backward compatibility)
function generateLegacyImageUrls(imageId: string) {
  // Resize to 300x200
  const resizedUrl = client.buildImageUrl(imageId, {
    resize: { width: 300, height: 200 }
  });
  console.log('Legacy - Resized image URL:', resizedUrl);

  // Complex transformations
  const complexUrl = client.buildImageUrl(imageId, {
    resize: { width: 500, height: 300 },
    brightness: 1.2,
    contrast: 1.1,
    sharpen: 0.8
  });
  console.log('Legacy - Complex transformations URL:', complexUrl);

  return {
    resizedUrl,
    complexUrl
  };
}

// Example: List all images
async function listImagesExample() {
  try {
    const images = await client.listImages(1, 10);
    console.log('Images:', images);
    return images;
  } catch (error) {
    console.error('Error listing images:', error);
    return null;
  }
}

// Example: Delete an image
async function deleteImageExample(imageId: string) {
  try {
    const result = await client.deleteImage(imageId);
    if (result.success) {
      console.log('Image deleted successfully');
      return true;
    } else {
      console.error('Failed to delete image:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// Export examples for usage in browser or Node.js
export {
  uploadExample,
  generateChainableImageUrls,
  generateLegacyImageUrls,
  listImagesExample,
  deleteImageExample
}; 