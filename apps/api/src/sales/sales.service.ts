import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';
import { CreateSaleDto } from './dto/create-sale.dto';
// PaymentType is a string: 'CASH' | 'CARD' | 'TRANSFER'

@Injectable()
export class SalesService {
    constructor(
        private prisma: PrismaService,
        private stockService: StockService,
    ) { }

    async createSale(dto: CreateSaleDto, userId: string) {
        if (!dto.lines || dto.lines.length === 0) {
            throw new BadRequestException('Satış sepeti boş olamaz');
        }

        // Validate stock for each line
        for (const line of dto.lines) {
            const currentStock = await this.stockService.getProductStock(line.productId);
            if (currentStock < line.quantity) {
                const product = await this.prisma.product.findUnique({ where: { id: line.productId } });
                throw new BadRequestException(
                    `Yetersiz stok: ${product?.name} (Mevcut: ${currentStock}, İstenen: ${line.quantity})`,
                );
            }
        }

        // Build sale lines with calculated totals
        const saleLines = await Promise.all(
            dto.lines.map(async (line) => {
                const product = await this.prisma.product.findUnique({ where: { id: line.productId } });
                if (!product) throw new BadRequestException(`Ürün bulunamadı: ${line.productId}`);
                const unitPrice = line.unitPrice ?? product.salePrice;
                const lineTotal = unitPrice * line.quantity;
                return {
                    productId: line.productId,
                    quantity: line.quantity,
                    unitPrice,
                    vatRate: product.vatRate,
                    lineTotal,
                };
            }),
        );

        const totalAmount = saleLines.reduce((sum, l) => sum + l.lineTotal, 0);
        const vatAmount = saleLines.reduce(
            (sum, l) => sum + (l.lineTotal * l.vatRate) / (100 + l.vatRate),
            0,
        );

        const receiptNo = await this.generateReceiptNo();

        // Create sale + stock movement in transaction
        const sale = await this.prisma.$transaction(async (tx) => {
            const newSale = await tx.sale.create({
                data: {
                    receiptNo,
                    userId,
                    paymentType: dto.paymentType || 'CASH',
                    totalAmount,
                    vatAmount,
                    notes: dto.notes,
                    lines: { create: saleLines },
                },
                include: { lines: { include: { product: true } } },
            });

            // Create OUT stock movement using tx client (not external service)
            const documentNo = `CKS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;
            await tx.stockMove.create({
                data: {
                    documentNo,
                    type: 'OUT',
                    reason: 'SALE',
                    description: `Satış: ${receiptNo}`,
                    userId,
                    saleId: newSale.id,
                    lines: {
                        create: saleLines.map((l) => ({
                            productId: l.productId,
                            quantity: l.quantity,
                        })),
                    },
                },
            });

            return newSale;
        });

        return sale;
    }

    async findAll(params: { page?: number; limit?: number; startDate?: string; endDate?: string }) {
        const page = parseInt(String(params.page || 1)) || 1;
        const limit = parseInt(String(params.limit || 20)) || 20;
        const { startDate, endDate } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
        }

        const [items, total] = await Promise.all([
            this.prisma.sale.findMany({
                where,
                include: { lines: { include: { product: true } }, user: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.sale.count({ where }),
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        const sale = await this.prisma.sale.findUnique({
            where: { id },
            include: { lines: { include: { product: true } }, user: { select: { name: true } } },
        });
        if (!sale) throw new NotFoundException('Satış bulunamadı');
        return sale;
    }

    async refund(saleId: string, userId: string) {
        const sale = await this.findOne(saleId);
        if (sale.refunded) throw new BadRequestException('Bu satış zaten iade edilmiş');

        const refundReceiptNo = await this.generateReceiptNo('IAD');

        const result = await this.prisma.$transaction(async (tx) => {
            // Mark original sale as refunded
            await tx.sale.update({ where: { id: saleId }, data: { refunded: true } });

            // Create refund sale (negative)
            const refundSale = await tx.sale.create({
                data: {
                    receiptNo: refundReceiptNo,
                    userId,
                    paymentType: sale.paymentType,
                    totalAmount: -sale.totalAmount,
                    vatAmount: -sale.vatAmount,
                    refundOfId: saleId,
                    notes: `İade: ${sale.receiptNo}`,
                    lines: {
                        create: sale.lines.map((l) => ({
                            productId: l.productId,
                            quantity: l.quantity,
                            unitPrice: l.unitPrice,
                            vatRate: l.vatRate,
                            lineTotal: -l.lineTotal,
                        })),
                    },
                },
                include: { lines: { include: { product: true } } },
            });

            // Create IN stock movement to return stock using tx client
            const documentNo = `GRS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;
            await tx.stockMove.create({
                data: {
                    documentNo,
                    type: 'IN',
                    reason: 'RETURN_IN',
                    description: `İade: ${sale.receiptNo}`,
                    userId,
                    saleId: refundSale.id,
                    lines: {
                        create: sale.lines.map((l) => ({
                            productId: l.productId,
                            quantity: l.quantity,
                        })),
                    },
                },
            });

            return refundSale;
        });

        return result;
    }

    private async generateReceiptNo(prefix = 'STS'): Promise<string> {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.sale.count({
            where: {
                createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
        });
        return `${prefix}-${today}-${String(count + 1).padStart(4, '0')}`;
    }
}
