import { Injectable, BadRequestException, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SmsProvider } from './sms.provider';
import { UserRole, JwtPayload } from '@allo-dakar/shared';

const OTP_TTL_MINUTES = 5;
const OTP_LENGTH = 4;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    @Inject('SMS_PROVIDER') private readonly smsProvider: SmsProvider,
  ) {}

  private generateCode(): string {
    // Code numérique simple. Pas destiné à une sécurité de niveau bancaire :
    // la fenêtre de validité courte + le fait que le code soit à usage unique
    // (consumedAt) suffisent pour ce cas d'usage.
    const min = 10 ** (OTP_LENGTH - 1);
    const max = 10 ** OTP_LENGTH - 1;
    return Math.floor(min + Math.random() * (max - min)).toString();
  }

  async requestOtp(dto: RequestOtpDto): Promise<{ expiresInSeconds: number }> {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    const existingUser = await this.prisma.user.findUnique({ where: { phone: dto.phone } });

    await this.prisma.otpCode.create({
      data: {
        phone: dto.phone,
        code,
        expiresAt,
        userId: existingUser?.id,
      },
    });

    await this.smsProvider.send(
      dto.phone,
      `Votre code Allo Dakar est ${code}. Il expire dans ${OTP_TTL_MINUTES} minutes.`,
    );

    return { expiresInSeconds: OTP_TTL_MINUTES * 60 };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ accessToken: string; isNewUser: boolean }> {
    const otp = await this.prisma.otpCode.findFirst({
      where: { phone: dto.phone, code: dto.code, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException('Code invalide ou déjà utilisé.');
    }
    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('Code expiré, veuillez en demander un nouveau.');
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    let user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    let isNewUser = false;

    if (!user) {
      if (!dto.fullName) {
        throw new BadRequestException(
          'Nom complet requis pour finaliser la création de compte.',
        );
      }
      user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          phoneVerified: true,
          fullName: dto.fullName,
          role: UserRole.CLIENT, // le rôle chauffeur est accordé explicitement via /drivers/register
        },
      });
      isNewUser = true;
    } else if (!user.phoneVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    const payload: JwtPayload = { sub: user.id, role: user.role as UserRole, phone: user.phone };
    const accessToken = await this.jwt.signAsync(payload);

    return { accessToken, isNewUser };
  }

  async validateUserById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
