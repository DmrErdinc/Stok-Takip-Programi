import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) { }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !user.active) {
            throw new UnauthorizedException('Geçersiz e-posta veya şifre');
        }

        const passwordValid = await bcrypt.compare(dto.password, user.password);
        if (!passwordValid) {
            throw new UnauthorizedException('Geçersiz e-posta veya şifre');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            ...tokens,
        };
    }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });

        if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı');
        return user;
    }

    async refreshToken(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.active) throw new UnauthorizedException('Geçersiz token');

        return this.generateTokens(user.id, user.email, user.role);
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const accessToken = this.jwt.sign(payload);
        const refreshToken = this.jwt.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET', 'refresh-default'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        });

        return { accessToken, refreshToken };
    }
}
