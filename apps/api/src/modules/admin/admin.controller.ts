import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, DriverStatus, BookingStatus } from '@allo-dakar/shared';

@Roles(UserRole.ADMIN)
@Controller('admin/stats')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('overview')
  async overview() {
    const [clientsCount, activeDriversCount, tripsCount, cancelledCount, totalBookings] =
      await Promise.all([
        this.prisma.user.count({ where: { role: UserRole.CLIENT } }),
        this.prisma.driverProfile.count({ where: { status: DriverStatus.VALIDE } }),
        this.prisma.booking.count({ where: { status: BookingStatus.TERMINEE } }),
        this.prisma.booking.count({ where: { status: BookingStatus.ANNULEE } }),
        this.prisma.booking.count(),
      ]);

    const topDestinations = await this.prisma.availability.groupBy({
      by: ['destinationCity'],
      _count: { destinationCity: true },
      orderBy: { _count: { destinationCity: 'desc' } },
      take: 5,
    });

    return {
      clientsCount,
      activeDriversCount,
      tripsCount,
      cancellationRate: totalBookings > 0 ? cancelledCount / totalBookings : 0,
      topDestinations: topDestinations.map((d: { destinationCity: string; _count: { destinationCity: number } }) => ({
        city: d.destinationCity,
        count: d._count.destinationCity,
      })),
    };
  }
}
