import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  AVAILABILITY_CREATED_EVENT,
  AvailabilityCreatedEvent,
} from '../availabilities/events/availability-created.event';
import { PushService } from './push.service';
import { NotificationType } from '@allo-dakar/shared';

// Anti-spam MVP : on ne renotifie pas un même utilisateur pour un même
// couple (origine, destination) plus d'une fois toutes les 6h, même si
// plusieurs chauffeurs publient des disponibilités proches dans le temps.
const DEDUP_WINDOW_HOURS = 6;

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  @OnEvent(AVAILABILITY_CREATED_EVENT)
  async handleAvailabilityCreated(event: AvailabilityCreatedEvent) {
    // Ciblage MVP : préférences déclaratives (ville favorite / destination
    // fréquente). Le scoring plus fin (proximité, budget, historique) est
    // prévu en phase 2 (cf. roadmap "notifications intelligentes").
    const interestedUsers = await this.prisma.userPreference.findMany({
      where: {
        OR: [
          { favoriteCities: { has: event.originCity } },
          { frequentDestinations: { has: event.destinationCity } },
        ],
      },
      select: { userId: true },
    });

    const dedupSince = new Date(Date.now() - DEDUP_WINDOW_HOURS * 60 * 60 * 1000);

    for (const { userId } of interestedUsers) {
      const recentDuplicate = await this.prisma.notification.findFirst({
        where: {
          userId,
          type: NotificationType.NEW_AVAILABILITY,
          relatedId: event.availabilityId,
          createdAt: { gte: dedupSince },
        },
      });
      if (recentDuplicate) continue;

      const title = 'Chauffeur disponible !';
      const body = `Trajet ${event.originCity} → ${event.destinationCity}, ${event.seatsAvailable} place(s) disponible(s).`;

      const notification = await this.prisma.notification.create({
        data: {
          userId,
          title,
          body,
          type: NotificationType.NEW_AVAILABILITY,
          relatedId: event.availabilityId,
        },
      });

      try {
        await this.push.sendToUser(userId, title, body, { availabilityId: event.availabilityId });
      } catch (err) {
        this.logger.warn(`Échec envoi push pour user ${userId}: ${err}`);
      }

      void notification; // conservé pour le centre de notifications in-app
    }
  }
}
