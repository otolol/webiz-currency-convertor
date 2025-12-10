import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateConversionDto } from './dto/create-conversion.dto';
import { RedisService } from 'src/redis/redis.service';
import { ExchangeRate } from 'src/exchange-rate/domain/exchange-rate.entity';
import { ISO_4217_MAP } from 'src/common/constants/iso-codes';
import { ConfigService } from '@nestjs/config';
import { IExchangeRateStrategy } from 'src/exchange-rate/domain/strategies/exchange-rate-strategy';
import { ConversionResponseDto } from './dto/conversion-response.dto';

@Injectable()
export class CurrencyService {

  constructor(
    private readonly redisService: RedisService,
    @Inject('IExchangeRateStrategy')
    private readonly exchangeRateStrategy: IExchangeRateStrategy,
    private readonly configService: ConfigService
  ) { }

  public async convert({ sourceCode, targetCode, amount }: CreateConversionDto): Promise<ConversionResponseDto> {
    let cachedRate = null;
    try {
      cachedRate = (await this.redisService.get<ExchangeRate>(`conversion:${sourceCode}:${targetCode}`))
        || (await this.redisService.get<ExchangeRate>(`conversion:${targetCode}:${sourceCode}`));
    } catch (error) {
      throw new BadRequestException('Invalid conversion parameters.');
    }


    if (cachedRate) {
      return {
        convertedAmount: this.calculate(cachedRate, sourceCode, amount),
        originalAmount: amount,
        sourceCurrency: sourceCode,
        targetCurrency: targetCode,
      }
    } else {
      let rate = null;
      rate = await this.exchangeRateStrategy.getRate(sourceCode, targetCode);

      if (!rate) {
        throw new BadRequestException('Invalid conversion parameters.');
      }
      if (rate) {
        await this.redisService.set(`conversion:${sourceCode}:${targetCode}`, rate, this.configService.get<number>(`CACHE_TTL`));
        return {
          convertedAmount: this.calculate(rate, sourceCode, amount),
          originalAmount: amount,
          sourceCurrency: sourceCode,
          targetCurrency: targetCode,
        }
      }
    }
  }

  private calculate(exchangeRate: ExchangeRate, sourceCode: string, amount: number) {
    const rate = exchangeRate.rateCross ??
      (exchangeRate.currencyCodeA === ISO_4217_MAP[sourceCode]
        ? exchangeRate.rateSell ?? exchangeRate.rateBuy
        : 1 / (exchangeRate.rateBuy ?? exchangeRate.rateSell ?? 1));

    return amount * rate;
  }

}
