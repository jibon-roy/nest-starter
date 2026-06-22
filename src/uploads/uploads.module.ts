import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { ImageManipulationModule } from '../../libs/image-manipulation/src';


@Module({
  imports: [ImageManipulationModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
