import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchasesController {
    constructor(private purchasesService: PurchasesService) { }

    @Post('orders')
    @Roles('ADMIN')
    createOrder(@Body() body: any) {
        return this.purchasesService.createOrder(body);
    }

    @Get('orders')
    findAllOrders(
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.purchasesService.findAllOrders({ status, page, limit });
    }

    @Get('orders/:id')
    findOneOrder(@Param('id') id: string) {
        return this.purchasesService.findOneOrder(id);
    }

    @Post('receipts')
    @Roles('ADMIN')
    receiveGoods(@Body() body: any, @Request() req: any) {
        return this.purchasesService.receiveGoods({ ...body, userId: req.user.sub });
    }
}
