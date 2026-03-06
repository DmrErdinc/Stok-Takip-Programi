import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockService } from '../stock/stock.service';

@Injectable()
export class PurchasesService {
    constructor(
        private prisma: PrismaService,
        private stockService: StockService,
    ) { }

    // ── Purchase Orders ──────────────────────────
    async createOrder(data: {
        supplierId: string;
        notes?: string;
        lines: { productId: string; quantity: number; unitCost: number }[];
    }) {
        const orderNo = await this.generateOrderNo();
        const totalAmount = data.lines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);

        return this.prisma.purchaseOrder.create({
            data: {
                orderNo,
                supplierId: data.supplierId,
                notes: data.notes,
                totalAmount,
                lines: { create: data.lines },
            },
            include: { lines: { include: { product: true } }, supplier: true },
        });
    }

    async findAllOrders(params: { status?: string; page?: number; limit?: number }) {
        const { status, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        const where: any = {};
        if (status) where.status = status;

        const [items, total] = await Promise.all([
            this.prisma.purchaseOrder.findMany({
                where,
                include: { lines: { include: { product: true } }, supplier: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.purchaseOrder.count({ where }),
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOneOrder(id: string) {
        const order = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: { lines: { include: { product: true } }, supplier: true, receipts: { include: { lines: true } } },
        });
        if (!order) throw new NotFoundException('Sipariş bulunamadı');
        return order;
    }

    // ── Receipts (Mal Kabul) ─────────────────────
    async receiveGoods(data: {
        purchaseOrderId: string;
        userId: string;
        notes?: string;
        lines: { productId: string; quantity: number; unitCost: number }[];
    }) {
        const order = await this.findOneOrder(data.purchaseOrderId);
        if (order.status === 'CANCELLED') throw new BadRequestException('İptal edilmiş sipariş');

        const receiptNo = await this.generateReceiptNo();

        const receipt = await this.prisma.$transaction(async (tx) => {
            const newReceipt = await tx.purchaseReceipt.create({
                data: {
                    receiptNo,
                    purchaseOrderId: data.purchaseOrderId,
                    notes: data.notes,
                    lines: { create: data.lines },
                },
                include: { lines: { include: { product: true } } },
            });

            // Update received quantities on order lines
            for (const line of data.lines) {
                const orderLine = order.lines.find((ol) => ol.productId === line.productId);
                if (orderLine) {
                    await tx.purchaseOrderLine.update({
                        where: { id: orderLine.id },
                        data: { receivedQty: { increment: line.quantity } },
                    });
                }
            }

            // Check if order is fully received
            const updatedOrder = await tx.purchaseOrder.findUnique({
                where: { id: data.purchaseOrderId },
                include: { lines: true },
            });

            const allReceived = updatedOrder!.lines.every(
                (l) => l.receivedQty + (data.lines.find((dl) => dl.productId === l.productId)?.quantity || 0) >= l.quantity,
            );

            await tx.purchaseOrder.update({
                where: { id: data.purchaseOrderId },
                data: { status: allReceived ? 'COMPLETED' : 'PARTIAL' },
            });

            // Create IN stock movement
            await this.stockService.createMovement({
                type: 'IN',
                reason: 'PURCHASE',
                description: `Satın alma: ${order.orderNo}`,
                userId: data.userId,
                purchaseReceiptId: newReceipt.id,
                lines: data.lines.map((l) => ({
                    productId: l.productId,
                    quantity: l.quantity,
                    unitCost: l.unitCost,
                })),
            });

            return newReceipt;
        });

        return receipt;
    }

    private async generateOrderNo(): Promise<string> {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.purchaseOrder.count();
        return `PO-${today}-${String(count + 1).padStart(4, '0')}`;
    }

    private async generateReceiptNo(): Promise<string> {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.purchaseReceipt.count();
        return `MK-${today}-${String(count + 1).padStart(4, '0')}`;
    }
}
