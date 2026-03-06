import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
    constructor(private salesService: SalesService) { }

    @Post()
    @Roles('ADMIN', 'CASHIER')
    create(@Body() dto: CreateSaleDto, @Request() req: any) {
        return this.salesService.createSale(dto, req.user.sub);
    }

    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.salesService.findAll({ page, limit, startDate, endDate });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salesService.findOne(id);
    }

    @Post(':id/refund')
    @Roles('ADMIN', 'CASHIER')
    refund(@Param('id') id: string, @Request() req: any) {
        return this.salesService.refund(id, req.user.sub);
    }
}
