import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockService {
    constructor(private prisma: PrismaService) { }

    /** Calculate current stock for a product from movements */
    async getProductStock(productId: string): Promise<number> {
        const inMoves = await this.prisma.stockMoveLine.aggregate({
            where: {
                productId,
                stockMove: { type: 'IN' },
            },
            _sum: { quantity: true },
        });

        const outMoves = await this.prisma.stockMoveLine.aggregate({
            where: {
                productId,
                stockMove: { type: 'OUT' },
            },
            _sum: { quantity: true },
        });

        const adjustMoves = await this.prisma.stockMoveLine.aggregate({
            where: {
                productId,
                stockMove: { type: 'ADJUST' },
            },
            _sum: { quantity: true },
        });

        const inQty = inMoves._sum.quantity || 0;
        const outQty = outMoves._sum.quantity || 0;
        const adjustQty = adjustMoves._sum.quantity || 0;

        return inQty - outQty + adjustQty;
    }

    /** Get stock levels for all products */
    async getAllStockLevels(params: { search?: string; page?: number; limit?: number }) {
        const page = parseInt(String(params.page || 1)) || 1;
        const limit = parseInt(String(params.limit || 50)) || 50;
        const { search } = params;
        const skip = (page - 1) * limit;

        const where: any = { deleted: false };
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { sku: { contains: search } },
            ];
        }

        const products = await this.prisma.product.findMany({
            where,
            include: { barcodes: true, category: true },
            skip,
            take: limit,
            orderBy: { name: 'asc' },
        });

        const total = await this.prisma.product.count({ where });

        const items = await Promise.all(
            products.map(async (p) => {
                const currentStock = await this.getProductStock(p.id);
                return { ...p, currentStock, isCritical: currentStock < p.minStock };
            }),
        );

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    /** Create a stock movement */
    async createMovement(params: {
        type: string;
        reason: string;
        description?: string;
        userId: string;
        saleId?: string;
        purchaseReceiptId?: string;
        lines: { productId: string; quantity: number; unitCost?: number }[];
    }) {
        const { type, reason, description, userId, saleId, purchaseReceiptId, lines } = params;

        // Validate stock for OUT movements
        if (type === 'OUT') {
            for (const line of lines) {
                const currentStock = await this.getProductStock(line.productId);
                if (currentStock < line.quantity) {
                    const product = await this.prisma.product.findUnique({ where: { id: line.productId } });
                    throw new BadRequestException(
                        `Yetersiz stok: ${product?.name || line.productId} (Mevcut: ${currentStock}, İstenen: ${line.quantity})`,
                    );
                }
            }
        }

        const documentNo = await this.generateDocumentNo(type);

        return this.prisma.stockMove.create({
            data: {
                documentNo,
                type,
                reason,
                description,
                userId,
                saleId,
                purchaseReceiptId,
                lines: {
                    create: lines.map((l) => ({
                        productId: l.productId,
                        quantity: l.quantity,
                        unitCost: l.unitCost,
                    })),
                },
            },
            include: { lines: { include: { product: true } }, user: true },
        });
    }

    /** Get movements for a product */
    async getProductMovements(productId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prisma.stockMove.findMany({
                where: { lines: { some: { productId } } },
                include: {
                    lines: { where: { productId }, include: { product: true } },
                    user: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.stockMove.count({
                where: { lines: { some: { productId } } },
            }),
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    /** Get all movements */
    async getAllMovements(params: { type?: string; page?: number; limit?: number }) {
        const page = parseInt(String(params.page || 1)) || 1;
        const limit = parseInt(String(params.limit || 20)) || 20;
        const { type } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (type) where.type = type;

        const [items, total] = await Promise.all([
            this.prisma.stockMove.findMany({
                where,
                include: { lines: { include: { product: true } }, user: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.stockMove.count({ where }),
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    /** Adjust stock (for stocktaking) */
    async adjustStock(params: {
        userId: string;
        description: string;
        lines: { productId: string; newQuantity: number }[];
    }) {
        const adjustLines: { productId: string; quantity: number }[] = [];

        for (const line of params.lines) {
            const currentStock = await this.getProductStock(line.productId);
            const diff = line.newQuantity - currentStock;
            if (diff !== 0) {
                adjustLines.push({ productId: line.productId, quantity: diff });
            }
        }

        if (adjustLines.length === 0) return { message: 'Stok farkı yok, düzeltme yapılmadı' };

        return this.createMovement({
            type: 'ADJUST',
            reason: 'ADJUSTMENT',
            description: params.description,
            userId: params.userId,
            lines: adjustLines,
        });
    }

    private async generateDocumentNo(type: string): Promise<string> {
        const prefix = type === 'IN' ? 'GRS' : type === 'OUT' ? 'CKS' : 'DZL';
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.prisma.stockMove.count({
            where: {
                type,
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        });
        return `${prefix}-${today}-${String(count + 1).padStart(4, '0')}`;
    }
}
