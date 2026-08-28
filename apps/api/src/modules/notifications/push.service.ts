import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Envoi de notifications push. Au MVP, le mobile est prévu en Expo
 * (cf. architecture mobile), donc on cible l'Expo Push Service qui
 * simplifie la gestion Android/iOS sans configurer FCM/APNs directement.
 *
 * Le token push de chaque appareil doit être enregistré via
 * PUT /users/me/push-token (à ajouter quand l'app mobile sera connectée) ;
 * pour l'instant, on log si aucun token n'est trouvé.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly expoPushUrl = 'https://exp.host/--/api/v2/push/send';

  constructor(private readonly prisma: PrismaService) {}

  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    // NOTE: le champ pushToken n'existe pas encore dans le schéma Prisma
    // (ajouté quand l'app mobile enregistrera les devices, phase 4).
    // Pour l'instant on se contente de logguer : le centre de notifications
    // in-app (table `notifications`) reste la source de vérité affichée
    // dans l'app tant que le push natif n'est pas branché.
    this.logger.log(`[PUSH SIMULÉ] -> user ${userId} | ${title} : ${body}`);
    void this.expoPushUrl;
    void data;
  }
}
