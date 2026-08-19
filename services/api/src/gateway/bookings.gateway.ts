import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, UseGuards } from '@nestjs/common';
import { SocketGuard } from './socket.guard';
import { BOOKING_EVENTS } from './events';

interface ConnectedUser {
  userId: string;
  role: string;
  socketId: string;
}

@WebSocketGateway({ cors: true })
export class BookingsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(BookingsGateway.name);
  private connectedUsers = new Map<string, ConnectedUser>();

  constructor(private readonly jwtService: JwtService) {}

  @UseGuards(SocketGuard)
  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;

      const userId = payload.sub || payload.id;
      const role = payload.role || 'passenger';

      this.connectedUsers.set(client.id, {
        userId,
        role,
        socketId: client.id,
      });

      this.logger.log(`Client connected: ${client.id} (user: ${userId}, role: ${role})`);
    } catch {
      this.logger.warn(`Connection rejected: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      this.logger.log(`Client disconnected: ${client.id} (user: ${user.userId})`);
    }
    this.connectedUsers.delete(client.id);
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(BOOKING_EVENTS.JOIN_BOOKING)
  handleJoinBookingRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ): void {
    const room = `booking:${data.bookingId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(BOOKING_EVENTS.DRIVER_LOCATION)
  handleDriverLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string; lat: number; lng: number },
  ): void {
    this.emitToBookingRoom(data.bookingId, BOOKING_EVENTS.DRIVER_LOCATION, {
      lat: data.lat,
      lng: data.lng,
      driverId: client.data.user?.sub || client.data.user?.id,
    });
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(BOOKING_EVENTS.BOOKING_ACCEPTED)
  handleBookingAccepted(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string; driverInfo: Record<string, unknown> },
  ): void {
    this.emitToBookingRoom(data.bookingId, BOOKING_EVENTS.BOOKING_ACCEPTED, {
      bookingId: data.bookingId,
      driverInfo: data.driverInfo,
    });
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(BOOKING_EVENTS.DRIVER_ARRIVING)
  handleDriverArriving(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ): void {
    this.emitToBookingRoom(data.bookingId, BOOKING_EVENTS.DRIVER_ARRIVING, {
      bookingId: data.bookingId,
    });
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(BOOKING_EVENTS.DRIVER_ARRIVED)
  handleDriverArrived(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ): void {
    this.emitToBookingRoom(data.bookingId, BOOKING_EVENTS.DRIVER_ARRIVED, {
      bookingId: data.bookingId,
    });
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(BOOKING_EVENTS.TRIP_STARTED)
  handleTripStarted(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ): void {
    this.emitToBookingRoom(data.bookingId, BOOKING_EVENTS.TRIP_STARTED, {
      bookingId: data.bookingId,
    });
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(BOOKING_EVENTS.TRIP_COMPLETED)
  handleTripCompleted(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ): void {
    this.emitToBookingRoom(data.bookingId, BOOKING_EVENTS.TRIP_COMPLETED, {
      bookingId: data.bookingId,
    });
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(BOOKING_EVENTS.BOOKING_CANCELLED)
  handleBookingCancelled(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string; reason?: string },
  ): void {
    this.emitToBookingRoom(data.bookingId, BOOKING_EVENTS.BOOKING_CANCELLED, {
      bookingId: data.bookingId,
      reason: data.reason,
      cancelledBy: client.data.user?.sub || client.data.user?.id,
    });
  }

  notifyPassenger(passengerId: string, event: string, data: Record<string, unknown>): void {
    const entry = Array.from(this.connectedUsers.values()).find(
      (u) => u.userId === passengerId && u.role === 'passenger',
    );
    if (entry) {
      this.server.to(entry.socketId).emit(event, data);
    }
  }

  notifyDriver(driverId: string, event: string, data: Record<string, unknown>): void {
    const entry = Array.from(this.connectedUsers.values()).find(
      (u) => u.userId === driverId && u.role === 'driver',
    );
    if (entry) {
      this.server.to(entry.socketId).emit(event, data);
    }
  }

  emitToBookingRoom(bookingId: string, event: string, data: Record<string, unknown>): void {
    this.server.to(`booking:${bookingId}`).emit(event, data);
  }
}
