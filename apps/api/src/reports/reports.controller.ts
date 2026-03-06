import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Get('critical-stock')
    criticalStock() {
        return this.reportsService.criticalStock();
    }

    @Get('sales-summary')
    salesSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('groupBy') groupBy?: string,
    ) {
        return this.reportsService.salesSummary({ startDate, endDate, groupBy });
    }

    @Get('top-sellers')
    topSellers(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('limit') limit?: number,
    ) {
        return this.reportsService.topSellers({ startDate, endDate, limit });
    }

    @Get('dead-stock')
    deadStock(@Query('days') days?: number) {
        return this.reportsService.deadStock(days);
    }

    @Get('stock-value')
    stockValue() {
        return this.reportsService.stockValue();
    }

    @Get('daily-summary')
    dailySummary(@Query('date') date?: string) {
        return this.reportsService.dailySummary(date);
    }
}
