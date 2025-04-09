import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import type { Request } from 'express'

import { TokenType, type User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { RedisService } from '@/src/core/redis/redis.service'
import { generateToken } from '@/src/shared/utils/generate-token.util'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { destroySession } from '@/src/shared/utils/session.util'

import { MailService } from '../../libs/mail/mail.service'
/* import { TelegramService } from '../../libs/telegram/telegram.service' */

import { DeactivateAccountInput } from './inputs/deactivate-account.input'

@Injectable()
export class DeactivateService {
    public constructor(
        private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService,
		private readonly mailSerivce: MailService
    ) {}

    public async deactivate (
        req: Request,
		input: DeactivateAccountInput,
		user: User,
		userAgent: string
    ) {
        const { email, password, pin } = input

        if (user.email !== email) {
			throw new BadRequestException('Wrong email')
        }

        const isValidPassword = await verify(user.password, password)

		if (!isValidPassword) {
			throw new BadRequestException('Wrong password')
		}

        if (!pin) {
			await this.sendDeactivateToken(req, user, userAgent)

			return { message: 'requires confirmation' }
		}

        await this.validateDeactivateToken(req, pin)

        return { user }
    }

    private async validateDeactivateToken (req: Request, token: string) {
        const existingToken = await this.prismaService.token.findUnique({
            where: {
                token
            }
        })

        if (!existingToken) {
            throw new NotFoundException('Wrong token')
        }

        const hasExpired = new Date(existingToken.expiresIn) > new Date();

        if (hasExpired) {
            throw new BadRequestException('Your token has expired')
        }

        const user = await this.prismaService.user.update({
            where: {
                id: existingToken.userId
            },
            data: {
				isDeactivated: true,
				deactivatedAt: new Date()
			}
        })

        await this.prismaService.token.delete({
            where: {
                type: TokenType.DEACTIVATE_ACCOUNT,
                id: existingToken.id
            }
        })

        await this.clearSessions(user.id);
        return destroySession(req, this.configService)
    }

    private async sendDeactivateToken(
        req: Request,
        user: User,
        userAgent: string
    ) {
        const deactivateToken = await generateToken(
            this.prismaService,
            user,
            TokenType.DEACTIVATE_ACCOUNT,
			false
        );

        const metadata = getSessionMetadata(req, userAgent);

        await this.mailSerivce.deactivate(
            user.email,
			deactivateToken.token,
			metadata
        )

        return true
    }

    private async clearSessions(userId: string) {
		const keys = await this.redisService.keys('*')

		for (const key of keys) {
			const sessionData = await this.redisService.get(key)

			if (sessionData) {
				const session = JSON.parse(sessionData)

				if (session.userId === userId) {
					await this.redisService.del(key)
				}
			}
		}
	}
}