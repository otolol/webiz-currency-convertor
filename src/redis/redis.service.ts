import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, RedisClientType } from "redis";

@Injectable()
export class RedisService {
  private readonly client: RedisClientType;
  constructor(
    private readonly configService: ConfigService
  ) {
    this.client = createClient({
      url: this.configService.get<string>('REDIS_URL') || 'redis://redis:6379',
    });
    this.client.on('error', (err) => {
      console.error('Redis error', err);
    });
    this.client.connect();
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data as string) as T) : null;
    } catch (error) {
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
      console.log('payload', ttlSeconds)
      await this.client.setEx(key, ttlSeconds, payload);
    } catch (error) {
      throw new InternalServerErrorException('Failed to set value in Redis', error);
    }
 
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

}