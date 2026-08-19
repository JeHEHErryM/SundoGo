import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { hash, compare } from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@sundogo/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        passenger: true,
        driver: true,
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await hash(dto.password, 10);
    const role = dto.role || UserRole.PASSENGER;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role,
      },
    });

    if (role === UserRole.DRIVER) {
      await this.prisma.driver.create({
        data: {
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
        },
      });
    } else {
      await this.prisma.passenger.create({
        data: {
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
        },
      });
    }

    const userWithProfile = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        passenger: true,
        driver: true,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = userWithProfile!;
    return this.login(userWithoutPassword);
  }

  generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }
}
