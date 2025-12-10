import { ApiProperty } from "@nestjs/swagger";

export class ConversionResponseDto {

  @ApiProperty({
    description: 'The converted amount',
    example: 100,
  })
  convertedAmount: number;

  @ApiProperty({
    description: 'The original amount',
    example: 100,
  })
  originalAmount: number;

  @ApiProperty({
    description: 'The source currency',
    example: 'USD',
  })
  sourceCurrency: string;

  @ApiProperty({
    description: 'The target currency',
    example: 'EUR',
  })
  targetCurrency: string;
}