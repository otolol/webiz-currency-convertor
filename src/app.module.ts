import { Module } from '@nestjs/common';
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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    })
  ],
})
export class AppModule { }
