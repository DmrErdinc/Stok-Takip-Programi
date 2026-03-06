import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    name?: string;

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
    @IsOptional()
    @Min(0)
    salePrice?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    costPrice?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    minStock?: number;

    @IsString()
    @IsOptional()
    shelfLocation?: string;

    @IsOptional()
    variant?: any;
}
