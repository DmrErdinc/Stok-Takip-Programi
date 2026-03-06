import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
    constructor(private stockService: StockService) { }

    @Get()
    getAllStockLevels(
        @Query('search') search?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.stockService.getAllStockLevels({ search, page, limit });
    }

    @Get('product/:productId')
    getProductStock(@Param('productId') productId: string) {
        return this.stockService.getProductStock(productId);
    }

    @Get('movements')
    getAllMovements(
        @Query('type') type?: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.stockService.getAllMovements({ type, page, limit });
    }

    @Get('movements/product/:productId')
    getProductMovements(
        @Param('productId') productId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.stockService.getProductMovements(productId, page, limit);
    }

    @Post('adjust')
    @Roles('ADMIN')
    adjustStock(@Request() req: any, @Body() body: { description: string; lines: { productId: string; newQuantity: number }[] }) {
        return this.stockService.adjustStock({
            userId: req.user.sub,
            description: body.description,
            lines: body.lines,
        });
    }

    @Post('movement')
    @Roles('ADMIN')
    createMovement(@Request() req: any, @Body() body: any) {
        return this.stockService.createMovement({
            ...body,
            userId: req.user.sub,
        });
    }
}
