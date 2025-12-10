import { Body, Controller, Post } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CreateConversionDto } from './dto/create-conversion.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConversionResponseDto } from './dto/conversion-response.dto';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) { }

  @ApiOperation({ summary: 'Convert currency' })
  @ApiResponse({ status: 200, description: 'Currency converted successfully', type: ConversionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 503, description: 'Service Unavailable: Upstream currency API unavailable' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('convert')
  convertCurrency(@Body() createConversionDto: CreateConversionDto) {
    return this.currencyService.convert(createConversionDto);
  }
}
