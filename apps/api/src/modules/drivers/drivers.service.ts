import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { ReviewDriverDto } from './dto/review-driver.dto';
import { UserRole, DriverStatus } from '@allo-dakar/shared';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Un client demande à devenir chauffeur : on crée le profil chauffeur
   * en statut "en_attente" et on passe le rôle utilisateur à "chauffeur".
   * Le compte reste toutefois bloqué pour publier des disponibilités tant
   * que le statut n'est pas "valide" (vérifié au niveau du module Availabilities).
   */
  async register(userId: string, dto: RegisterDriverDto) {
    const existing = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException('Une demande chauffeur existe déjà pour ce compte.');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.$transaction(async (tx: any) => {
      await tx.user.update({ where: { id: userId }, data: { role: UserRole.CHAUFFEUR } });
      return tx.driverProfile.create({
        data: {
          userId,
          idDocumentUrl: dto.idDocumentUrl,
          licenseDocumentUrl: dto.licenseDocumentUrl,
          bio: dto.bio,
          status: DriverStatus.EN_ATTENTE,
        },
      });
    });
  }

  async listPending() {
    return this.prisma.driverProfile.findMany({
      where: { status: DriverStatus.EN_ATTENTE },
      include: { user: true },
      orderBy: { user: { createdAt: 'asc' } },
    });
  }

  async review(driverUserId: string, dto: ReviewDriverDto, adminId: string) {
    const profile = await this.prisma.driverProfile.findUnique({ where: { userId: driverUserId } });
    if (!profile) throw new NotFoundException('Profil chauffeur introuvable.');

    return this.prisma.driverProfile.update({
      where: { userId: driverUserId },
      data: {
        status: dto.status,
        validatedAt: new Date(),
        validatedBy: adminId,
      },
    });
  }
}
