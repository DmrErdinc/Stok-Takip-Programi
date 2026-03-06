import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class BarcodeDto {
    @IsString()
    code: string;

    @IsString()
    @IsOptional()
    label?: string;
}

export class CreateProductDto {
    @IsString()
    sku: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    categoryId?: string;

    @IsString()
    @IsOptional()
    brand?: string;

    @IsNumber()
    @IsOptional()
    vatRate?: number;

    @IsNumber()
    @Min(0)
    salePrice: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    costPrice?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    minStock?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    initialStock?: number;

    @IsString()
    @IsOptional()
    shelfLocation?: string;

    @IsOptional()
    variant?: any;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BarcodeDto)
    @IsOptional()
    barcodes?: BarcodeDto[];
}
