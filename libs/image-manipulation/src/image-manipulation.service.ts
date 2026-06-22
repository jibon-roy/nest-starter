import { Injectable } from '@nestjs/common';
import sharp, { Sharp } from 'sharp';

interface Options {
  reduceSize?: number;
  format?: 'webp' | 'png';
  quality?: number;
  width?: number;
  height?: number;
}

@Injectable()
export class ImageManipulationService {

  /**
   * Convert image to WebP format
   */
  async toWebp(image: any): Promise<Sharp> {
    return sharp(image, { failOn: 'none' })
      .toFormat('webp')
      .webp();
  }

  /**
   * Create thumbnail from image
   */
  async toThumbnail(image: any, options: Options = {}): Promise<Sharp> {
    const metaData = await sharp(image).metadata();

    const width =
      options.reduceSize && metaData.width
        ? Math.floor(metaData.width * options.reduceSize)
        : options.width ?? metaData.width;

    return sharp(image)
      .resize(width)
      .toFormat('webp')
      .webp({
        quality: options.quality ?? 100,
      });
  }
}