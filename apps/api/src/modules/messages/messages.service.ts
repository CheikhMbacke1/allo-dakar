import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertParticipant(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { availability: true },
    });
    if (!booking) throw new NotFoundException('Réservation introuvable.');
    const isParticipant =
      booking.clientId === userId || booking.availability.driverId === userId;
    if (!isParticipant) {
      throw new ForbiddenException("Vous n'êtes pas partie prenante de cette réservation.");
    }
    return booking;
  }

  async send(userId: string, bookingId: string, dto: CreateMessageDto) {
    await this.assertParticipant(userId, bookingId);
    return this.prisma.message.create({
      data: { bookingId, senderId: userId, content: dto.content },
    });
  }

  async listForBooking(userId: string, bookingId: string) {
    await this.assertParticipant(userId, bookingId);
    return this.prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
