import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { FilePathDecorator as FilePath } from 'src/decorators/file_path.decorator';
import { memoryStorage } from 'multer';
import { ServiceGuard } from 'src/guards/service.guard';

@Controller(':service/*')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @UseGuards(ServiceGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      //Only allow image files
      fileFilter: (req, file, cb) =>
        cb(null, file.mimetype.startsWith('image')),
      storage: memoryStorage(),
    }),
  )
  async uploadImage(
    @Param('service') service: string,
    @FilePath() path: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('user') user?: string,
    @Body('limitQuota') limitQuota?: number,
    @Body('preserveFilename') preserveFilename?: boolean,
  ) {
    return await this.imageService.uploadImage(
      service,
      path,
      file,
      user,
      limitQuota,
      preserveFilename,
    );
  }

  @UseGuards(ServiceGuard)
  @Delete()
  async deleteImage(
    @Param('service') service: string,
    @FilePath() path: string,
  ) {
    return this.imageService.deleteFile(service, path);
  }
}
