import Logger from 'bunyan';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';

const cacheName: string = 'redisConnection';
const log: Logger = config.createLogger(cacheName);

class RedisConnection extends BaseCache {
  constructor() {
    super(cacheName);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      log.error(error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
