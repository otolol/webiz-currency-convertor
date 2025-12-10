import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CurrencyModule } from './currency/currency.module';
import { RedisModule } from './redis/redis.module';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { ConfigModule } from '@nestjs/config';


const ENV = process.env.NODE_ENV;


@Module({
  imports: [
    CurrencyModule,
    RedisModule,
    ExchangeRateModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    })
  ],
})
export class AppModule { }
