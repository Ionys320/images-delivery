import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { RedisService } from 'src/redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from 'src/entities/file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly redisService: RedisService,
  ) {}

  private readonly mainPath = process.env.DELIVERY_MAIN_PATH;

  buildPath(service: string, path: string, id?: string) {
    if (!id) id = '';

    return join(this.mainPath, service, path, id);
  }

  async uploadImage(
    service: string,
    path: string,
    image: Express.Multer.File,
    user?: string,
    limitQuota?: number,
    preserveFilename?: boolean,
  ) {
    const { buffer, size, originalname } = image;

    // Check if the user has enough quota
    if (limitQuota) {
      const quota = await this.getQuota(service, user);

      if (quota + size > limitQuota) throw new Error('Quota exceeded');
    }

    const fileName = preserveFilename
      ? originalname
      : `${randomUUID()}.${image.mimetype.split('/')[1]}`;
    const filePath = this.buildPath(service, path, fileName);
    const directoryPath = this.buildPath(service, path);

    // Save image
    mkdirSync(directoryPath, { recursive: true });
    writeFileSync(filePath, buffer);

    // Save the image in the database
    await this.fileRepository.save({
      service,
      path,
      size: size,
      user,
    });

    // Edit quota for the user
    this.redisService.client.hIncrBy(`${service}:quota`, user, size);

    const url = (
      process.env.DOMAIN + join('/', service, path, fileName)
    ).replaceAll('\\', '/');
    return url;
  }

  async deleteFile(service: string, path: string) {
    const filePath = this.buildPath(service, path);

    // Remove the image from the file system
    if (existsSync(filePath)) rmSync(filePath);

    // Get the file from the database
    const file = await this.fileRepository.findOne({
      where: { service, path },
    });

    if (!file) return;

    // Reduce quota for the user
    this.redisService.client.hIncrBy(`${service}:quota`, file.user, -file.size);

    // Delete image from database
    await this.fileRepository.delete({ service, path });
  }

  // Quota
  async initiateQuota() {
    const files = await this.fileRepository.find({
      select: ['service', 'size', 'user'],
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { service, user, size } = file;

      await this.redisService.client.hIncrBy(`${service}:quota`, user, size);
    }
  }

  async getQuota(service: string, user: string) {
    const quota = await this.redisService.client.hGet(`${service}:quota`, user);

    return quota ? parseInt(quota) : 0;
  }
}
