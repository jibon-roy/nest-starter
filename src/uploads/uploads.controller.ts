import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Get,
  Query,
  Header,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { v4 as uuid } from 'uuid';
import { ProcessImageDto } from './dto/process-image.dto';
import { Response } from 'express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { ImageManipulationService } from '../../libs/image-manipulation/src';
import { ApplyVersionHeader } from '../common/decorators/apply-version-header.decorator';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CheckPermissionsFor } from '../auth/guards/permissions.decorator';
type UploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};


@ApplyVersionHeader()
@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly imageManipulation: ImageManipulationService,
    private readonly uploadService: UploadsService,
  ) {}

  @ApiBearerAuth()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 1 }]))
  @Post('images')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermissionsFor('Image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadImage(
    @UploadedFiles()
    files: {
      images?: UploadedFile[];
    },
  ) {
    if (!files.images) {
      throw new BadRequestException('Please provide at least one image');
    }

    const image = files.images[0];
    const generatedUUID = uuid();

    const webpImage = await this.imageManipulation.toWebp(image.buffer);

    const data = await this.uploadService.uploadImageLocally(
      `${generatedUUID}`,
      await webpImage.toBuffer(),
      'image/webp',
    );

    return {
      data: data.url,
    };
  }

  @Get('images')
  @Header('content-type', 'image/webp')
  async processImage(
    @Query() processImageDto: ProcessImageDto,
    @Res() res: Response,
  ) {
    const processedImage = await this.imageManipulation.toThumbnail(
      this.uploadService.resolveImageSource(processImageDto.image),
      {
        quality: processImageDto.q,
        width: processImageDto.w,
      },
    );

    const buffer = await processedImage.toBuffer();

    return res.status(200).contentType('image/webp').send(buffer);
  }
}
