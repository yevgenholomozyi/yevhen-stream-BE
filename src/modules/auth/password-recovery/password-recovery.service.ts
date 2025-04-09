import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { hash } from 'argon2'
import { PrismaService } from "@/src/core/prisma/prisma.service";
import { Request } from "express";
import { NewPasswordInput } from "./inputs/new-password.input";
import { ResetPasswordInput } from "./inputs/reset-password.input";
import { MailService } from "@/src/modules/libs/mail/mail.service";
import { generateToken } from "@/src/shared/utils/generate-token.util";
import { TokenType } from '@/prisma/generated/default';
import { getSessionMetadata } from "@/src/shared/utils/session-metadata.util";

@Injectable()
export class PasswrodRecoveryService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly mailService: MailService
    ) {}

    public async resetPassword(req: Request, input: ResetPasswordInput, userAgent: string) {
        const { email } = input;
        const user = await this.prismaService.user.findUnique({
            where: {
                email
            },
            include: {
				notificationSettings: true
			}
        })

        if (!user) {
            throw new NotFoundException('User not found')
        }

        const resetToken = await generateToken(
            this.prismaService,
            user, 
            TokenType.PASSWORD_RESET
        );
        const metadata = getSessionMetadata(req, userAgent);

        await this.mailService.sendPasswordResetToken(email, resetToken.token, metadata);

       /*  if (
			generateToken.user.notificationSettings.telegramNotifications &&
			generateToken.user.telegramId
		) {
			await this.telegramService.sendPasswordResetToken(
				resetToken.user.telegramId,
				resetToken.token,
				metadata
			)
		} */
        return true;
    }

    public async newPassword(req: Request, input: NewPasswordInput) {
        const { password, passwordRepeat, token } = input;

        if (password !== passwordRepeat) {
            throw new BadRequestException('Password and passwordRepeat do not match');
        }
        const existingToken = await this.prismaService.token.findUnique({
            where: {
                token,
                type: TokenType.PASSWORD_RESET
            }
        })

        if (!existingToken) {
            throw new NotFoundException('Invalid or expired token');
        }

        const isExpired = new Date(existingToken.expiresIn) < new Date();

        if (isExpired) {
            throw new BadRequestException('Token has expired');
        }

        await this.prismaService.user.update({
            where: {
                id: existingToken.userId
            },
            data: {
                password: await hash(password)
            }
        })

        await this.prismaService.token.delete({
            where: {
                id: existingToken.id
            }
        })

        return true;
    }
}
