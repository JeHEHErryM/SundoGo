import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsGateway } from '../gateway/bookings.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { UpdatePassengerDto } from './dto/update-passenger.dto';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';

const ACTIVE_BOOKING_STATUSES = [
  BookingStatus.REQUESTED,
  BookingStatus.SEARCHING,
  BookingStatus.ACCEPTED,
  BookingStatus.DRIVER_ARRIVING,
  BookingStatus.DRIVER_ARRIVED,
  BookingStatus.IN_PROGRESS,
];

@Injectable()
export class PassengersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: BookingsGateway,
    private readonly notifications: NotificationsService,
  ) {}

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

  /**
   * Raises an emergency alert: notifies the driver of the active booking in
   * real time (socket + notification) and returns the passenger's emergency
   * contacts so the client can offer immediate call/SMS actions.
   */
  async triggerEmergencyAlert(passengerId: string, message?: string) {
    const passenger = await this.prisma.passenger.findUnique({
      where: { id: passengerId },
      include: { emergencyContacts: true },
    });
    if (!passenger) throw new NotFoundException('Passenger profile not found');

    const booking = await this.prisma.booking.findFirst({
      where: {
        passengerId,
        status: { in: ACTIVE_BOOKING_STATUSES },
      },
      include: {
        driver: { include: { user: { select: { id: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (booking && booking.driver) {
      const payload = {
        bookingId: booking.id,
        passengerName: `${passenger.firstName} ${passenger.lastName}`.trim(),
        passengerPhone: passenger.phone,
        pickupAddress: booking.pickupAddress,
        destinationAddress: booking.destinationAddress,
        message: message ?? null,
        triggeredAt: new Date().toISOString(),
      };

      this.gateway.emitToBookingRoom(booking.id, 'emergency:alert', payload);

      void this.notifications.create(
        booking.driver.user.id,
        'EMERGENCY_ALERT',
        'Emergency alert',
        `${passenger.firstName} triggered an emergency alert during your trip.`,
        payload,
      );
    }

    return {
      contacts: passenger.emergencyContacts,
      bookingId: booking?.id ?? null,
      driverNotified: !!booking?.driver,
    };
  }
}
