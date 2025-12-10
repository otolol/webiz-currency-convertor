import { ExchangeRate } from "../exchange-rate.entity";

export interface IExchangeRateStrategy {
  getRate(sourceCode: string, targetCode: string): Promise<ExchangeRate | null>;
}