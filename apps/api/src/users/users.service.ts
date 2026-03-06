import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: { email: string; password: string; name: string; role: string }) {
        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) throw new ConflictException('Bu e-posta zaten kayıtlı');

        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: { email: data.email, password: hashedPassword, name: data.name, role: data.role },
            select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
        });
    }

    async update(id: string, data: { name?: string; role?: string; active?: boolean; password?: string }) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.active !== undefined) updateData.active = data.active;
        if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
        });
    }

    async remove(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
        return this.prisma.user.update({
            where: { id },
            data: { active: false },
            select: { id: true, email: true, name: true, role: true, active: true },
        });
    }

    /** Get sales grouped by cashier */
    async getSalesByCashier(params?: { startDate?: string; endDate?: string }) {
        const where: any = {};
        if (params?.startDate || params?.endDate) {
            where.createdAt = {};
            if (params?.startDate) where.createdAt.gte = new Date(params.startDate);
            if (params?.endDate) where.createdAt.lte = new Date(params.endDate + 'T23:59:59');
        }

        const sales = await this.prisma.sale.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                lines: { include: { product: { select: { name: true, sku: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Group by user
        const byUser: Record<string, { user: any; sales: any[]; totalAmount: number; saleCount: number }> = {};
        for (const sale of sales) {
            const uid = sale.userId;
            if (!byUser[uid]) {
                byUser[uid] = { user: sale.user, sales: [], totalAmount: 0, saleCount: 0 };
            }
            byUser[uid].sales.push(sale);
            byUser[uid].totalAmount += sale.totalAmount;
            byUser[uid].saleCount += 1;
        }

        return {
            allSales: sales,
            byCashier: Object.values(byUser),
        };
    }
}
