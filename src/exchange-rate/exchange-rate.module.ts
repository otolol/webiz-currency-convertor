import { Module } from "@nestjs/common";
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from "src/redis/redis.module";
import { MonobankClient } from "./infrastructure/monobank.client";
import { RedisExchangeRateRepository } from "./infrastructure/redis-exchange-rate.repository";
import { MonoBankExchangeRateStrategy } from "./application/strategies/monobank-exchange-rate.service";

@Module({
  imports: [
    RedisModule,
    HttpModule
  ],
  providers: [
    MonobankClient,
    
    {
      provide: 'IExchangeRateRepository',
      useClass: RedisExchangeRateRepository,
    },
    {
      provide: 'IExchangeRateStrategy',
      useClass: MonoBankExchangeRateStrategy,
    }
  ],
  exports: [
    'IExchangeRateStrategy'
  ],
})
export class ExchangeRateModule {}