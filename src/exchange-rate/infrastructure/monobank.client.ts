import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { ExchangeRate } from "../domain/exchange-rate.entity";
import { firstValueFrom, retry } from "rxjs";
import { ConfigService } from "@nestjs/config";

const RESET_TIMEOUT = 60000;
const MAX_FAILURES = 3;

@Injectable()
export class MonobankClient {

  private isCircuitOpen = false;
  private lastFailureTime = 0;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) { }

  public async getRates(): Promise<ExchangeRate[]> {
    if (this.isCircuitOpen) {
      if (Date.now() - this.lastFailureTime > RESET_TIMEOUT) {
        this.isCircuitOpen = false;
      } else {
        throw new ServiceUnavailableException('Circuit is open: Monobank API is unavailable');
      }
    }
    try {
      const { data } = await firstValueFrom(this.httpService.get(this.configService.get('MONOBANK_API_URL')).pipe(
        retry(MAX_FAILURES),
      ));
      return data;
    } catch (error) {
      this.isCircuitOpen = true;
      this.lastFailureTime = Date.now();
      throw new ServiceUnavailableException('Monobank API unavailable');
    }
  }

}