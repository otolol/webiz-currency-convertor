import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { ExchangeRateModule } from 'src/exchange-rate/exchange-rate.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [ExchangeRateModule, RedisModule],
  controllers: [CurrencyController],
  providers: [CurrencyService],
})
export class CurrencyModule { }
