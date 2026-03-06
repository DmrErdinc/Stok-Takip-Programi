import {
    Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
    constructor(private productsService: ProductsService) { }

    @Post()
    @Roles('ADMIN')
    create(@Body() dto: CreateProductDto, @Request() req: any) {
        return this.productsService.create(dto, req.user.sub);
    }

    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.productsService.findAll({ search, categoryId, page, limit });
    }

    @Get('search')
    search(@Query('q') query: string) {
        return this.productsService.search(query || '');
    }

    @Get('barcode/:code')
    findByBarcode(@Param('code') code: string) {
        return this.productsService.findByBarcode(code);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }

    @Post(':id/barcodes')
    @Roles('ADMIN')
    addBarcode(
        @Param('id') id: string,
        @Body('code') code: string,
        @Body('label') label?: string,
    ) {
        return this.productsService.addBarcode(id, code, label);
    }

    @Delete('barcodes/:barcodeId')
    @Roles('ADMIN')
    removeBarcode(@Param('barcodeId') barcodeId: string) {
        return this.productsService.removeBarcode(barcodeId);
    }
}
