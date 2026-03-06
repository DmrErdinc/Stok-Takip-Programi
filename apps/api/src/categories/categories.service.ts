import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany({
            include: { children: true, _count: { select: { products: true } } },
            where: { parentId: null },
            orderBy: { name: 'asc' },
        });
    }

    async create(name: string, parentId?: string) {
        return this.prisma.category.create({ data: { name, parentId } });
    }

    async update(id: string, name: string) {
        const cat = await this.prisma.category.findUnique({ where: { id } });
        if (!cat) throw new NotFoundException('Kategori bulunamadı');
        return this.prisma.category.update({ where: { id }, data: { name } });
    }

    async remove(id: string) {
        return this.prisma.category.delete({ where: { id } });
    }
}
