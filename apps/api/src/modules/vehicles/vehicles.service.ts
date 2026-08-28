import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(driverId: string, dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({ data: { driverId, ...dto } });
  }

  async listMine(driverId: string) {
    return this.prisma.vehicle.findMany({ where: { driverId } });
  }

  async remove(driverId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Véhicule introuvable.');
    if (vehicle.driverId !== driverId) {
      throw new ForbiddenException("Ce véhicule n'appartient pas à ce chauffeur.");
    }
    return this.prisma.vehicle.delete({ where: { id: vehicleId } });
  }
}
