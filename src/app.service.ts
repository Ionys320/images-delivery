import { Injectable, Logger } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { ImageService } from './image/image.service';

@Injectable()
export class AppService {
  constructor(private readonly imageService: ImageService) {
    const deliveryMainPath = process.env.DELIVERY_MAIN_PATH;
    const services = process.env.SERVICES.split(',');

    for (const service of services) {
      const path = join(deliveryMainPath, service);
      mkdirSync(path, { recursive: true });
    }

    Logger.log('Delivery paths created', 'AppService');

    this.imageService.initiateQuota();
  }

  getPing(): string {
    return 'Pong!';
  }
}
