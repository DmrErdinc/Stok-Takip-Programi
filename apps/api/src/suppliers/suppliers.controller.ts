import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
    constructor(private suppliersService: SuppliersService) { }

    @Get()
    findAll() {
        return this.suppliersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.suppliersService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() body: { name: string; phone?: string; email?: string; address?: string; taxNumber?: string }) {
        return this.suppliersService.create(body);
    }

    @Put(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() body: any) {
        return this.suppliersService.update(id, body);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.suppliersService.remove(id);
    }
}
