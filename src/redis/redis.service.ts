import { Injectable } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  readonly client: RedisClientType<any, any, any>;

  constructor() {
    this.client = createClient({
      url: 'redis://localhost:6379',
    });

    this.client.connect();
  }
}
