import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { SearchAvailabilityDto } from './dto/search-availability.dto';
import { DriverStatus } from '@allo-dakar/shared';
import {
  AVAILABILITY_CREATED_EVENT,
  AvailabilityCreatedEvent,
} from './events/availability-created.event';

function toTimeDate(hhmm: string): Date {
  // Prisma @db.Time attend une Date ; seule l'heure est significative.
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m));
}

@Injectable()
export class AvailabilitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async create(driverId: string, dto: CreateAvailabilityDto) {
    const driverProfile = await this.prisma.driverProfile.findUnique({ where: { userId: driverId } });
    if (!driverProfile || driverProfile.status !== DriverStatus.VALIDE) {
      throw new ForbiddenException(
        "Votre compte chauffeur doit être validé par l'administration avant de publier une disponibilité.",
      );
    }

    if (dto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
      if (!vehicle || vehicle.driverId !== driverId) {
        throw new BadRequestException("Véhicule invalide pour ce chauffeur.");
      }
    }

    const availability = await this.prisma.availability.create({
      data: {
        driverId,
        vehicleId: dto.vehicleId,
        originCity: dto.originCity,
        originZone: dto.originZone,
        destinationCity: dto.destinationCity,
        travelDate: new Date(dto.travelDate),
        departureTime: toTimeDate(dto.departureTime),
        availabilityEndTime: dto.availabilityEndTime ? toTimeDate(dto.availabilityEndTime) : undefined,
        seatsTotal: dto.seatsTotal,
        seatsAvailable: dto.seatsTotal,
        pricePerSeat: dto.pricePerSeat,
        homePickupAvailable: dto.homePickupAvailable ?? false,
        pickupZones: dto.pickupZones ?? [],
        notes: dto.notes,
      },
    });

    // Déclenche la recherche des clients intéressés (module Notifications),
    // sans coupler directement ce service à la logique de notification.
    this.events.emit(
      AVAILABILITY_CREATED_EVENT,
      new AvailabilityCreatedEvent(
        availability.id,
        availability.originCity,
        availability.destinationCity,
        availability.travelDate,
        availability.departureTime,
        availability.seatsAvailable,
      ),
    );

    return availability;
  }

  async search(dto: SearchAvailabilityDto) {
    return this.prisma.availability.findMany({
      where: {
        originCity: { equals: dto.originCity, mode: 'insensitive' },
        destinationCity: { equals: dto.destinationCity, mode: 'insensitive' },
        travelDate: dto.travelDate ? new Date(dto.travelDate) : undefined,
        isCancelled: false,
        seatsAvailable: { gt: 0 },
      },
      include: {
        driver: { select: { id: true, fullName: true, driverProfile: true } },
        vehicle: true,
      },
      orderBy: { departureTime: 'asc' },
    });
  }

  async listMine(driverId: string) {
    return this.prisma.availability.findMany({
      where: { driverId },
      orderBy: { travelDate: 'desc' },
      include: { bookings: true },
    });
  }

  async cancel(driverId: string, availabilityId: string) {
    const availability = await this.prisma.availability.findUnique({ where: { id: availabilityId } });
    if (!availability) throw new NotFoundException('Disponibilité introuvable.');
    if (availability.driverId !== driverId) {
      throw new ForbiddenException("Cette disponibilité n'appartient pas à ce chauffeur.");
    }
    return this.prisma.availability.update({
      where: { id: availabilityId },
      data: { isCancelled: true },
    });
  }
}
