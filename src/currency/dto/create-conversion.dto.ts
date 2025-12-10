import { IsString, IsNotEmpty, IsNumber, IsPositive, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidCurrency } from 'src/common/validators/is-valid-currency.validator';

export class CreateConversionDto {
  @ApiProperty({
    description: 'The source currency code',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  @IsValidCurrency()
  sourceCode: string;

  @ApiProperty({
    description: 'The target currency code',
    example: 'EUR',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  @IsValidCurrency()
  targetCode: string;

  @ApiProperty({
    description: 'The amount to convert',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;
}