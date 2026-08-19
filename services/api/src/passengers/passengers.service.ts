import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { UpdatePassengerDto } from './dto/update-passenger.dto';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';

@Injectable()
export class PassengersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    const passenger = await this.prisma.passenger.findUnique({
      where: { userId },
      include: { emergencyContacts: true, user: { select: { id: true, email: true, role: true } } },
    });
    if (!passenger) throw new NotFoundException('Passenger profile not found');
    return passenger;
  }

  async findById(id: string) {
    const passenger = await this.prisma.passenger.findUnique({
      where: { id },
      include: { emergencyContacts: true, user: { select: { id: true, email: true, role: true } } },
    });
    if (!passenger) throw new NotFoundException('Passenger not found');
    return passenger;
  }

  async create(userId: string, data: CreatePassengerDto) {
    const existing = await this.prisma.passenger.findUnique({ where: { userId } });
    if (existing) throw new HttpException('Passenger profile already exists', HttpStatus.CONFLICT);

    return this.prisma.passenger.create({
      data: { userId, ...data },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
  }

  async update(id: string, data: UpdatePassengerDto) {
    const passenger = await this.prisma.passenger.findUnique({ where: { id } });
    if (!passenger) throw new NotFoundException('Passenger not found');

    return this.prisma.passenger.update({
      where: { id },
      data,
      include: { emergencyContacts: true, user: { select: { id: true, email: true, role: true } } },
    });
  }

  async getEmergencyContacts(passengerId: string) {
    return this.prisma.emergencyContact.findMany({
      where: { passengerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addEmergencyContact(passengerId: string, data: CreateEmergencyContactDto) {
    const passenger = await this.prisma.passenger.findUnique({ where: { id: passengerId } });
    if (!passenger) throw new NotFoundException('Passenger not found');

    return this.prisma.emergencyContact.create({
      data: { passengerId, ...data },
    });
  }

  async removeEmergencyContact(id: string) {
    const contact = await this.prisma.emergencyContact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('Emergency contact not found');

    await this.prisma.emergencyContact.delete({ where: { id } });
    return { success: true };
  }
}
