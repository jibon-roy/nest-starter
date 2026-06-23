import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { basename, join, resolve } from 'path';

type LocalUploadResult = {
  filename: string;
  path: string;
  url: string;
  contentType: string;
};

@Injectable()
export class UploadsService {
  private readonly uploadRoot = resolve(
    process.cwd(),
    process.env.UPLOAD_DIR || 'uploads',
  );
  private readonly imageUploadDir = join(this.uploadRoot, 'images');

  /**
   *
   * @param image
   * @returns Promise
   */
  async uploadImageLocally(
    imageKey: string,
    imageBuffer: Buffer,
    contentType: string,
  ): Promise<LocalUploadResult> {
    await mkdir(this.imageUploadDir, { recursive: true });

    const filename = `${this.sanitizeFilename(imageKey)}.webp`;
    const filePath = join(this.imageUploadDir, filename);

    await writeFile(filePath, imageBuffer);

    return {
      filename,
      path: filePath,
      url: `/uploads/images/${filename}`,
      contentType,
    };
  }

  resolveImageSource(image: string): string {
    const pathname = this.getPathname(image);

    if (!pathname.startsWith('/uploads/images/')) {
      return image;
    }

    return join(this.imageUploadDir, basename(decodeURIComponent(pathname)));
  }

  private getPathname(image: string): string {
    try {
      return new URL(image, 'http://localhost').pathname;
    } catch {
      return image;
    }
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9_-]/g, '');
  }
}
