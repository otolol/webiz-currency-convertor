import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateConversionDto } from './dto/create-conversion.dto';
import { ExchangeRate } from 'src/exchange-rate/domain/exchange-rate.entity';
import { ISO_4217_MAP } from 'src/common/constants/iso-codes';
import { IExchangeRateStrategy } from 'src/exchange-rate/domain/strategies/exchange-rate-strategy';
import { ConversionResponseDto } from './dto/conversion-response.dto';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    @Inject('IExchangeRateStrategy')
    private readonly exchangeRateStrategy: IExchangeRateStrategy,
  ) { }

  public async convert({ sourceCode, targetCode, amount }: CreateConversionDto): Promise<ConversionResponseDto> {
    this.logger.log(`Converting ${amount} ${sourceCode} to ${targetCode}`, { sourceCode, targetCode, amount });

    let rate = null;
    rate = await this.exchangeRateStrategy.getRate(sourceCode, targetCode);

    if (!rate) {
      this.logger.error(`Unable to find exchange rate for ${sourceCode} to ${targetCode}`);
      throw new BadRequestException(`Unable to find exchange rate for ${sourceCode} to ${targetCode}`);
    }

    return {
      convertedAmount: this.calculate(rate, sourceCode, amount),
      originalAmount: amount,
      sourceCurrency: sourceCode,
      targetCurrency: targetCode,
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
