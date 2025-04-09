import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from 'prisma/generated';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { MailService } from 'src/modules/libs/mail/mail.service';
import { VerificationInput } from './inputs/verification-input';
import { TokenType } from '@/prisma/generated/default';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { saveSession } from '@/src/shared/utils/session.util';
import { generateToken } from '@/src/shared/utils/generate-token.util';

@Injectable()
export class VerificationService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly mailService: MailService
    ) {}

    public async verify(req: Request, input: VerificationInput, userAgent: string) {
        const { token } = input;

		const dbToken = await this.prismaService.token.findUnique({
			where: {
				token,
				type: TokenType.EMAIL_VERIFY
			}
		});

        if (!dbToken) {
            throw new NotFoundException('Invalid token');
        }

        const hasExpired = new Date(dbToken.expiresIn) < new Date();

        if (hasExpired) {
            throw new BadRequestException('Token has expired');
        }

        const user = await this.prismaService.user.update({
            where: {
                id: dbToken.userId,
            },
            data: {
                isEmailVerified: true
            }
        });

        await this.prismaService.token.delete({
            where: {
                id: dbToken.userId,
            },
        });

        const metadata = await getSessionMetadata(req, userAgent);
        return saveSession(req, user, metadata);

    }

    public async sendVerficationToken(user: User) {
        const verificationToken = await generateToken(
			this.prismaService,
			user,
			TokenType.EMAIL_VERIFY
		)

        console.log('verificationToken ', verificationToken);

		await this.mailService.sendVerificationToken(
			user.email,
			verificationToken.token
		)

		return true

    }
}
