import {
    Injectable,
    UnauthorizedException,
    ConflictException
} from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { LoginInput } from './inputs/login.input';
import type { Request } from 'express';
import { verify } from 'argon2'
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../core/redis/redis.service';
import { VerificationService } from '../verification/verification.service';
import { UserAgent } from '../../../shared/decorators/user-agent.decorator';
import { getSessionMetadata } from '../../../shared/utils/session-metadata.util';
import { destroySession, saveSession } from '../../../shared/utils/session.util';
import { checkTOTP } from '../../../shared/utils/checkTOTP.util';

@Injectable()
export class SessionService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
        private readonly verificationService: VerificationService
    ) {}

    public async findByUser(req: Request) {
        const userId = req.session.userId;
        const keys = await this.redisService.keys('*');
        const userSessions = [];
        for (const key of keys) {
			const sessionData = await this.redisService.get(key)

			if (sessionData) {
				const session = JSON.parse(sessionData)

				if (session.userId === userId) {
					userSessions.push({
						...session,
						id: key.split(':')[1]
					})
				}
			}
		}

		userSessions.sort((a, b) => b.createdAt - a.createdAt)

		return userSessions.filter(session => session.id !== req.session.id)
    }

    public async FindCurrent(req: Request) {
        const sessionId = req.session.id

		const sessionData = await this.redisService.get(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
		)

        const parsedSession = JSON.parse(sessionData);
        return {
            ...parsedSession,
            id: sessionId
        }
    }

    public async login(req: Request, input: LoginInput, @UserAgent() userAgent: string) {
        const { login, password, pin } = input;
        const user = await this.prismaService.user.findFirst({
            where: {
                OR: [
                    { username: { equals: login } },
                    { email: { equals: login } }
                ]
            }
        })

        const { isEmailVerified, isTotpEnabled, password: userPassword } = user;

        if (!user || !userPassword) {
            throw new UnauthorizedException('Wrong Login or Password')
        }

        if (!isEmailVerified) {
            await this.verificationService.sendVerficationToken(user)
            throw new UnauthorizedException(
                'This account is not verified, please check your email for verification link'
            )
        }

        if (isTotpEnabled) {
            checkTOTP(pin, user)
        }

        const isPasswordValid = await verify(userPassword, password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Wrong Login or Password')
        }

        if (!user.isEmailVerified) {
            throw new UnauthorizedException('Email not verified')
        }

        const metadata = getSessionMetadata(req, userAgent);

       saveSession(req, user, metadata);
    }
    public async logout(req: Request) {
        return destroySession(req, this.configService);
    }

    public async clearSession(req: Request) {
        req.res.clearCookie(
            this.configService.getOrThrow<string>('SESSION_NAME')
        );
        return true;
    }

    public async remove(req: Request, id: string) {
        const sessionId = req.session.id;
        if (req.session.id === id) {
			throw new ConflictException('We can not remove current session')
		}

        await this.redisService.del(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`
		)

        return true;
    }
}
