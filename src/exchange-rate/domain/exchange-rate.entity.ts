export type CurrencyCode = number;

export class ExchangeRate {
  currencyCodeA: CurrencyCode;
  currencyCodeB: CurrencyCode;
  date: number;
  rateBuy?: number;
  rateSell?: number;
  rateCross?: number;
}
