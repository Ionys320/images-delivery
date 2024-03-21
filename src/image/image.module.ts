import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from 'src/entities/file.entity';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [ImageService, RedisService],
  controllers: [ImageController],
  exports: [ImageService],
})
export class ImageModule {}
