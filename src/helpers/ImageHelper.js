const sharp = require('sharp');
const path = require('path');
const ExifReader = require('exifreader');

class ImageHelper {
  // Resize image while maintaining aspect ratio
  static async resize(imageBuffer, width, height, options = {}) {
    return await sharp(imageBuffer)
      .resize(width, height, { fit: options.fit || 'contain', ...options })
      .toBuffer();
  }

  // Crop image to specified dimensions
  static async crop(imageBuffer, width, height, options = {}) {
    return await sharp(imageBuffer)
      .extract({
        left: options.left || 0,
        top: options.top || 0,
        width,
        height
      })
      .toBuffer();
  }

  // Convert image format
  static async convert(imageBuffer, format, options = {}) {
    return await sharp(imageBuffer)[format](options).toBuffer();
  }

  // Compress image
  static async compress(imageBuffer, options = {}) {
    return await sharp(imageBuffer)
      .jpeg({ quality: options.quality || 80 })
      .toBuffer();
  }

  // Add watermark to image
  static async watermark(imageBuffer, watermarkBuffer, options = {}) {
    const { top = 0, left = 0, opacity = 0.5 } = options;

    return await sharp(imageBuffer)
      .composite([{
        input: watermarkBuffer,
        top,
        left,
        blend: 'over',
        opacity
      }])
      .toBuffer();
  }

  // Get image metadata
  static async getMetadata(imageBuffer) {
    const metadata = await sharp(imageBuffer).metadata();
    const tags = await ExifReader.load(imageBuffer);
    return { ...metadata, exif: tags };
  }

  // Rotate image
  static async rotate(imageBuffer, angle, options = {}) {
    return await sharp(imageBuffer)
      .rotate(angle, options)
      .toBuffer();
  }

  // Apply filters (brightness, contrast, etc)
  static async applyFilters(imageBuffer, filters = {}) {
    const image = sharp(imageBuffer);
    
    if (filters.brightness) image.modulate({ brightness: filters.brightness });
    if (filters.contrast) image.modulate({ contrast: filters.contrast });
    if (filters.saturation) image.modulate({ saturation: filters.saturation });
    if (filters.blur) image.blur(filters.blur);
    if (filters.sharpen) image.sharpen(filters.sharpen);
    
    return await image.toBuffer();
  }

  // Generate thumbnail
  static async createThumbnail(imageBuffer, width = 200, height = 200) {
    return await sharp(imageBuffer)
      .resize(width, height, { fit: 'cover' })
      .toBuffer();
  }
}

module.exports = ImageHelper;