import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) { }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() body: { name: string; parentId?: string }) {
        return this.categoriesService.create(body.name, body.parentId);
    }

    @Put(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body('name') name: string) {
        return this.categoriesService.update(id, name);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}
