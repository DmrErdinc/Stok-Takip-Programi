import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateProductDto, userId: string) {
        const existing = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
        if (existing) throw new ConflictException('Bu SKU zaten kullanılıyor');

        const initialStock = Number(dto.initialStock || 0);

        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    sku: dto.sku,
                    name: dto.name,
                    description: dto.description,
                    categoryId: dto.categoryId,
                    brand: dto.brand,
                    vatRate: dto.vatRate ?? 18,
                    salePrice: dto.salePrice,
                    costPrice: dto.costPrice ?? 0,
                    minStock: dto.minStock ?? 5,
                    shelfLocation: dto.shelfLocation,
                    variant: dto.variant,
                    barcodes: dto.barcodes?.length
                        ? { create: dto.barcodes.map((b) => ({ code: b.code, label: b.label })) }
                        : undefined,
                },
                include: { barcodes: true, category: true },
            });

            if (Number.isFinite(initialStock) && initialStock > 0) {
                const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const documentNo = `GRS-${today}-${String(Date.now()).slice(-4)}`;
                await tx.stockMove.create({
                    data: {
                        documentNo,
                        type: 'IN',
                        reason: 'PURCHASE',
                        description: `Başlangıç stok: ${product.name}`,
                        userId,
                        lines: {
                            create: [{ productId: product.id, quantity: Math.trunc(initialStock), unitCost: dto.costPrice ?? 0 }],
                        },
                    },
                });
            }

            return product;
        });
    }

    async findAll(params: { search?: string; categoryId?: string; page?: number; limit?: number }) {
        const page = parseInt(String(params.page || 1)) || 1;
        const limit = parseInt(String(params.limit || 20)) || 20;
        const { search, categoryId } = params;
        const skip = (page - 1) * limit;

        const where: any = { deleted: false };
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { sku: { contains: search } },
                { brand: { contains: search } },
                { barcodes: { some: { code: { contains: search } } } },
            ];
        }
        if (categoryId) where.categoryId = categoryId;

        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: { barcodes: true, category: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where }),
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { barcodes: true, category: true },
        });
        if (!product || product.deleted) throw new NotFoundException('Ürün bulunamadı');
        return product;
    }

    async findByBarcode(code: string) {
        const barcode = await this.prisma.barcode.findUnique({
            where: { code },
            include: { product: { include: { barcodes: true, category: true } } },
        });
        if (!barcode || barcode.product.deleted) throw new NotFoundException('Barkod bulunamadı');
        return barcode.product;
    }

    async search(query: string) {
        return this.prisma.product.findMany({
            where: {
                deleted: false,
                OR: [
                    { name: { contains: query } },
                    { sku: { contains: query } },
                    { barcodes: { some: { code: { contains: query } } } },
                ],
            },
            include: { barcodes: true, category: true },
            take: 20,
        });
    }

    async update(id: string, dto: UpdateProductDto) {
        await this.findOne(id);
        return this.prisma.product.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                categoryId: dto.categoryId,
                brand: dto.brand,
                vatRate: dto.vatRate,
                salePrice: dto.salePrice,
                costPrice: dto.costPrice,
                minStock: dto.minStock,
                shelfLocation: dto.shelfLocation,
                variant: dto.variant,
            },
            include: { barcodes: true, category: true },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.product.update({
            where: { id },
            data: { deleted: true },
        });
    }

    async addBarcode(productId: string, code: string, label?: string) {
        await this.findOne(productId);
        const existing = await this.prisma.barcode.findUnique({ where: { code } });
        if (existing) throw new ConflictException('Bu barkod zaten kayıtlı');
        return this.prisma.barcode.create({ data: { code, label, productId } });
    }

    async removeBarcode(barcodeId: string) {
        return this.prisma.barcode.delete({ where: { id: barcodeId } });
    }
}
