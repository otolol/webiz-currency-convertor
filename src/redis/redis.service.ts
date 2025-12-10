import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, RedisClientType } from "redis";

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClientType;
  
  constructor(
    private readonly configService: ConfigService
  ) {
    this.client = createClient({
      url: this.configService.get<string>('REDIS_URL') || 'redis://redis:6379',
    });
    this.client.on('error', (err) => {
      this.logger.error('Redis error', err);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
    this.logger.log('Redis connected successfully');
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data as string) as T) : null;
    } catch (error) {
      this.logger.error('Failed to get value from Redis', error);
      throw new InternalServerErrorException('Failed to get value from Redis', JSON.stringify(this.client));
    }
  }
  async set(
    key: string,
    value: any,
    ttlSeconds: number = this.configService.get<number>('REDIS_CACHE_TTL'),
  ): Promise<void> {
    
    try {
      const payload = JSON.stringify(value);
      await this.client.setEx(key, ttlSeconds, payload);
    } catch (error) {
      this.logger.error('Failed to set value in Redis', error);
      throw new InternalServerErrorException('Failed to set value in Redis', error);
    }
 
  }

  async del(key: string): Promise<void> {
    this.logger.log('Deleting value from Redis', { key });
    await this.client.del(key);
  }

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection');
    await this.client.quit();
  }

}