import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.supplier.findMany({
            where: { active: true },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) throw new NotFoundException('Tedarikçi bulunamadı');
        return supplier;
    }

    async create(data: { name: string; phone?: string; email?: string; address?: string; taxNumber?: string }) {
        return this.prisma.supplier.create({ data });
    }

    async update(id: string, data: { name?: string; phone?: string; email?: string; address?: string; taxNumber?: string }) {
        await this.findOne(id);
        return this.prisma.supplier.update({ where: { id }, data });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.supplier.update({ where: { id }, data: { active: false } });
    }
}
