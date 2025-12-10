import { RedisService } from "src/redis/redis.service";
import { ExchangeRate } from "../domain/exchange-rate.entity";
import { IExchangeRateRepository } from "../domain/exchange-rate.repository";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
const CACHE_KEY = 'MONOBANK_EXCHANGE_RATES';


@Injectable()
export class RedisExchangeRateRepository implements IExchangeRateRepository {

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService
  ) { }

  public async getAll(): Promise<ExchangeRate[]> {
    return this.redisService.get<ExchangeRate[]>(CACHE_KEY);
  }

  public async setAll(rates: ExchangeRate[]): Promise<void> {
    await this.redisService.set(CACHE_KEY, rates, this.configService.get<number>(`REDIS_CACHE_TTL`));
  }
}