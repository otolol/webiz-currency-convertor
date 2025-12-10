import {  ExchangeRate } from "./exchange-rate.entity";


export interface IExchangeRateRepository {
  getAll(): Promise<ExchangeRate[]>;
  setAll(rates: ExchangeRate[]): Promise<void>;
}