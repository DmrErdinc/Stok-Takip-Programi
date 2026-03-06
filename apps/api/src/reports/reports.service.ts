import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';

@Injectable()
export class ReportsService {
    constructor(
        private prisma: PrismaService,
        private stockService: StockService,
    ) { }

    /** Critical stock report — products at or below minStock */
    async criticalStock() {
        const products = await this.prisma.product.findMany({
            where: { deleted: false },
            include: { barcodes: true, category: true },
        });

        const items = await Promise.all(
            products.map(async (p) => {
                const currentStock = await this.stockService.getProductStock(p.id);
                return { ...p, currentStock, isCritical: currentStock < p.minStock };
            }),
        );

        return items.filter((i) => i.isCritical).sort((a, b) => a.currentStock - b.currentStock);
    }

    /** Sales summary report */
    async salesSummary(params: { startDate?: string; endDate?: string; groupBy?: string }) {
        const { startDate, endDate } = params;

        const where: any = { refunded: false };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
        }

        const sales = await this.prisma.sale.findMany({
            where,
            include: { lines: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });

        const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalVat = sales.reduce((sum, s) => sum + s.vatAmount, 0);
        const totalSales = sales.length;

        // Group by payment type
        const byPaymentType = sales.reduce((acc: any, s) => {
            const key = s.paymentType;
            if (!acc[key]) acc[key] = { count: 0, total: 0 };
            acc[key].count++;
            acc[key].total += s.totalAmount;
            return acc;
        }, {});

        // Group by day
        const byDay = sales.reduce((acc: any, s) => {
            const day = s.createdAt.toISOString().slice(0, 10);
            if (!acc[day]) acc[day] = { count: 0, total: 0 };
            acc[day].count++;
            acc[day].total += s.totalAmount;
            return acc;
        }, {});

        return { totalSales, totalRevenue, totalVat, byPaymentType, byDay, sales };
    }

    /** Top sellers report */
    async topSellers(params: { startDate?: string; endDate?: string; limit?: number }) {
        const { startDate, endDate, limit = 10 } = params;

        const where: any = {};
        if (startDate || endDate) {
            where.sale = { createdAt: {} };
            if (startDate) where.sale.createdAt.gte = new Date(startDate);
            if (endDate) where.sale.createdAt.lte = new Date(endDate + 'T23:59:59');
        }

        const saleLines = await this.prisma.saleLine.groupBy({
            by: ['productId'],
            where,
            _sum: { quantity: true, lineTotal: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: limit,
        });

        const items = await Promise.all(
            saleLines.map(async (sl) => {
                const product = await this.prisma.product.findUnique({
                    where: { id: sl.productId },
                    include: { barcodes: true },
                });
                return {
                    product,
                    totalQuantity: sl._sum.quantity || 0,
                    totalRevenue: sl._sum.lineTotal || 0,
                };
            }),
        );

        return items;
    }

    /** Dead stock — products with no sales */
    async deadStock(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const productsWithSales = await this.prisma.saleLine.findMany({
            where: { createdAt: { gte: since } },
            select: { productId: true },
            distinct: ['productId'],
        });

        const soldProductIds = productsWithSales.map((p) => p.productId);

        const deadProducts = await this.prisma.product.findMany({
            where: {
                deleted: false,
                id: { notIn: soldProductIds },
            },
            include: { barcodes: true, category: true },
        });

        const items = await Promise.all(
            deadProducts.map(async (p) => {
                const currentStock = await this.stockService.getProductStock(p.id);
                return { ...p, currentStock };
            }),
        );

        return items.filter((i) => i.currentStock > 0);
    }

    /** Stock value report */
    async stockValue() {
        const products = await this.prisma.product.findMany({
            where: { deleted: false },
            include: { barcodes: true },
        });

        const items = await Promise.all(
            products.map(async (p) => {
                const currentStock = await this.stockService.getProductStock(p.id);
                return {
                    ...p,
                    currentStock,
                    costValue: currentStock * p.costPrice,
                    saleValue: currentStock * p.salePrice,
                };
            }),
        );

        const totalCostValue = items.reduce((sum, i) => sum + i.costValue, 0);
        const totalSaleValue = items.reduce((sum, i) => sum + i.saleValue, 0);

        return {
            items: items.filter((i) => i.currentStock > 0),
            totalCostValue,
            totalSaleValue,
            potentialProfit: totalSaleValue - totalCostValue,
        };
    }

    /** Daily summary (gün sonu raporu) */
    async dailySummary(date?: string) {
        const targetDate = date ? new Date(date) : new Date();
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);

        const sales = await this.prisma.sale.findMany({
            where: { createdAt: { gte: dayStart, lte: dayEnd }, refunded: false },
            include: { lines: true },
        });

        const refunds = await this.prisma.sale.findMany({
            where: { createdAt: { gte: dayStart, lte: dayEnd }, refundOfId: { not: null } },
        });

        const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalRefunds = refunds.reduce((sum, r) => sum + Math.abs(r.totalAmount), 0);
        const totalItems = sales.reduce((sum, s) => sum + s.lines.reduce((ls, l) => ls + l.quantity, 0), 0);

        const byPaymentType = sales.reduce((acc: any, s) => {
            const key = s.paymentType;
            if (!acc[key]) acc[key] = { count: 0, total: 0 };
            acc[key].count++;
            acc[key].total += s.totalAmount;
            return acc;
        }, {});

        return {
            date: targetDate.toISOString().slice(0, 10),
            totalSales: sales.length,
            totalItems,
            totalRevenue,
            totalRefunds,
            netRevenue: totalRevenue - totalRefunds,
            byPaymentType,
        };
    }
}
