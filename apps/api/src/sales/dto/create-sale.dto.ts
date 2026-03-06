import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class SaleLineDto {
    @IsString()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    unitPrice?: number;
}

export class CreateSaleDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SaleLineDto)
    lines: SaleLineDto[];

    @IsString()
    @IsOptional()
    paymentType?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
