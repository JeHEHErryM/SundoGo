import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'fallback-secret'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    // Controllers need the role-profile IDs (passengerId/driverId) alongside
    // the user ID, so resolve them here once per authenticated request.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        passenger: { select: { id: true } },
        driver: { select: { id: true } },
      },
    });
    if (!user) return null;

    return {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      passengerId: user.passenger?.id,
      driverId: user.driver?.id,
    };
  }
}
