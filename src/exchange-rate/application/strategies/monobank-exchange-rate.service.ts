import { BadRequestException, Inject } from "@nestjs/common";
import { ISO_4217_MAP } from "src/common/constants/iso-codes";
import { ExchangeRate } from "src/exchange-rate/domain/exchange-rate.entity";
import { IExchangeRateRepository } from "src/exchange-rate/domain/exchange-rate.repository";
import { IExchangeRateStrategy } from "src/exchange-rate/domain/strategies/exchange-rate-strategy";
import { MonobankClient } from "src/exchange-rate/infrastructure/monobank.client";

export class MonoBankExchangeRateStrategy implements IExchangeRateStrategy {

  constructor(
    @Inject('IExchangeRateRepository')
    private readonly exchangeRateRepository: IExchangeRateRepository,
    private readonly monobankClient: MonobankClient
  ) { }

  public async getRate(sourceCode: string, targetCode: string): Promise<ExchangeRate | null> {
      const cachedRates = await this.exchangeRateRepository.getAll();
      
      if(cachedRates) {
        return this.findConversionRate(cachedRates, sourceCode, targetCode);
      } else {
        const rates = await this.monobankClient.getRates();
        await this.exchangeRateRepository.setAll(rates);
        return this.findConversionRate(rates, sourceCode, targetCode);
      }
  }

  private findConversionRate(
    rates: ExchangeRate[],
    sourceCode: string,
    targetCode: string
  ): ExchangeRate | null {

    if(!sourceCode || !targetCode) {
      throw new BadRequestException('Invalid conversion parameters.');
    }


    if (sourceCode === targetCode) {
      return {
        currencyCodeA: ISO_4217_MAP[sourceCode],
        currencyCodeB: ISO_4217_MAP[targetCode],
        date: Date.now() / 1000,
        rateBuy: 1,
        rateSell: 1,
        rateCross: 1
      };
    }

    const fromCode = ISO_4217_MAP[sourceCode];
    const toCode = ISO_4217_MAP[targetCode];
    const UAH_CODE = ISO_4217_MAP['UAH'];

    const direct = rates.find(rate =>
      (rate.currencyCodeA === fromCode && rate.currencyCodeB === toCode) ||
      (rate.currencyCodeA === toCode && rate.currencyCodeB === fromCode)
    );

    if (direct) {
      if (direct.currencyCodeA === fromCode && direct.currencyCodeB === toCode) {
        return {
          currencyCodeA: fromCode,
          currencyCodeB: toCode,
          date: direct.date,
          rateBuy: direct.rateSell ?? direct.rateBuy ?? direct.rateCross,
          rateSell: direct.rateBuy ?? direct.rateSell ?? direct.rateCross,
          rateCross: direct.rateCross
        };
      } else if (direct.currencyCodeA === toCode && direct.currencyCodeB === fromCode) {
        const rateSellValue = direct.rateSell ? 1 / direct.rateSell : 
                              direct.rateBuy ? 1 / direct.rateBuy : 
                              direct.rateCross ? 1 / direct.rateCross : undefined;
        const rateBuyValue = direct.rateBuy ? 1 / direct.rateBuy :
                             direct.rateSell ? 1 / direct.rateSell :
                             direct.rateCross ? 1 / direct.rateCross : undefined;
        
        if (rateSellValue !== undefined) {
          return {
            currencyCodeA: fromCode,
            currencyCodeB: toCode,
            date: direct.date,
            rateBuy: rateBuyValue,
            rateSell: rateSellValue,
            rateCross: direct.rateCross
          };
        }
      }
    }

    if (fromCode !== UAH_CODE && toCode !== UAH_CODE) {
      const toUah = rates.find(rate => rate.currencyCodeA === fromCode && rate.currencyCodeB === UAH_CODE);
      const fromUah = rates.find(rate => rate.currencyCodeA === toCode && rate.currencyCodeB === UAH_CODE);

      let rateSourceToUah: number | undefined;
      if (toUah) {
        rateSourceToUah = toUah.rateBuy ?? toUah.rateSell ?? toUah.rateCross;
      }
      let rateUahToTarget: number | undefined = undefined;
      if (fromUah) {
        if (fromUah.rateSell) rateUahToTarget = 1 / fromUah.rateSell;
        else if (fromUah.rateBuy) rateUahToTarget = 1 / fromUah.rateBuy;
        else if (fromUah.rateCross) rateUahToTarget = 1 / fromUah.rateCross;
      }

      if (rateSourceToUah !== undefined && rateUahToTarget !== undefined) {
        const crossValue = rateSourceToUah * rateUahToTarget;
        return {
          currencyCodeA: fromCode,
          currencyCodeB: toCode,
          date: Math.max(toUah!.date, fromUah!.date),
          rateBuy: crossValue,
          rateSell: crossValue,
          rateCross: crossValue
        };
      }
    }

    if (fromCode === UAH_CODE) {
      const targetRate = rates.find(rate => rate.currencyCodeA === toCode && rate.currencyCodeB === UAH_CODE);
      if (targetRate) {
        let rate: number | undefined;
        if (targetRate.rateSell) rate = 1 / targetRate.rateSell;
        else if (targetRate.rateBuy) rate = 1 / targetRate.rateBuy;
        else if (targetRate.rateCross) rate = 1 / targetRate.rateCross;
        if (rate !== undefined) {
          return {
            currencyCodeA: fromCode,
            currencyCodeB: toCode,
            date: targetRate.date,
            rateBuy: rate,
            rateSell: rate,
            rateCross: rate
          };
        }
      }
    }

    if (toCode === UAH_CODE) {
      const sourceRate = rates.find(rate => rate.currencyCodeA === fromCode && rate.currencyCodeB === UAH_CODE);
      if (sourceRate) {
        let rate: number | undefined = sourceRate.rateBuy ?? sourceRate.rateSell ?? sourceRate.rateCross;
        if (rate !== undefined) {
          return {
            currencyCodeA: fromCode,
            currencyCodeB: toCode,
            date: sourceRate.date,
            rateBuy: rate,
            rateSell: rate,
            rateCross: rate
          };
        }
      }
    }
    return null;
  }
}