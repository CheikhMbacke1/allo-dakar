import { Injectable, Logger } from '@nestjs/common';

/**
 * Abstraction du fournisseur SMS. Au MVP, on log le code en console
 * (dev) plutôt que d'envoyer un vrai SMS — aucun fournisseur SMS
 * sénégalais/international n'a encore été choisi/contracté.
 * Pour brancher un vrai fournisseur (Twilio, Orange SMS API, etc.),
 * il suffit de remplacer l'implémentation de `send()` ici : le reste
 * de l'application ne dépend que de cette interface.
 */
export interface SmsProvider {
  send(phone: string, message: string): Promise<void>;
}

@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  private readonly logger = new Logger(ConsoleSmsProvider.name);

  async send(phone: string, message: string): Promise<void> {
    this.logger.warn(`[DEV SMS] à ${phone} : ${message}`);
  }
}
