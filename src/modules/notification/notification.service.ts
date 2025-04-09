import { Injectable } from "@nestjs/common";
import { 
    NotificationType,
    type SponsorshipPlan,
    TokenType,
    type User,
} from "@prisma/generated"

import { PrismaService } from "@/src/core/prisma/prisma.service"
import { generateTokenString } from '@/src/shared/utils/generate-token.util'
import { NotificationInput } from './inputs/notification.input'


@Injectable()
export class NotificationService {
    public constructor(
        private readonly prismaService: PrismaService,
    ) {}

    public async findUnderCount(user: User) {
        const count = await this.prismaService.notification.count({
            where: {
                isRead: false,
                userId: user.id,
            }
        })
        return count;
    }

    public async findUnreadCount(user: User) {
        const count = await this.prismaService.notification.count({
            where: {
                isRead: false,
                userId: user.id,
            }
        })
        return count;
    }

    public async findByUser(user: User) {
		await this.prismaService.notification.updateMany({
			where: {
				isRead: false,
				userId: user.id
			},
			data: {
				isRead: true
			}
		})

		const notifications = await this.prismaService.notification.findMany({
			where: {
				userId: user.id
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return notifications
	}

    public async createStreamStart(userId: string, channel: User) {
        const notification = await this.prismaService.notification.create({
			data: {
				message: `<b className='font-medium'>Do not miss it!</b>
				<p>Join the stream on the channel <a href='/${channel.username}' className='font-semibold'>${channel.displayName}</a>.</p>`,
				type: NotificationType.STREAM_START,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})

		return notification
    }

    public async createNewFollowing(userId: string, follower: User) {
        const notification = await this.prismaService.notification.create({
            data: {
                message: `<b className='font-medium>Congradulations</b> <p>You have a new follower</p> <p>Follower: ${follower.username}</p> <p>${follower.displayName}</p>`,
                type: NotificationType.NEW_FOLLOWER,
                user: {
                    connect: {
                        id: userId,
                    }
                },
            },
        })
        return notification;
    }

    public async createNewSponsorship(userId: string, plan: SponsorshipPlan, sponsor: User) {
        const notification = await this.prismaService.notification.create({
            data: {
                message: `<b className='font-medium>Congradulations</b> <p>You have a new sponsor</p> <p>Sponsor: ${sponsor.username}</p> <p>Plan: ${plan}</p>`,
                type: NotificationType.NEW_SPONSORSHIP,
                user: {
                    connect: {
                        id: userId,
                    }
                },
            }          
        })
        return notification
    }

    public async createEnableTwoFactor(userId: string) {
        const notification = await this.prismaService.notification.create({
            data: {
                message: `<b className='font-medium>Congradulations</b> <p>Two factor authentication has been enabled</p>`,
                type: NotificationType.ENABLE_TWO_FACTOR,
                userId,
            }          
        })
        return notification;
    }

    public async createVerifyChannel(userId: string) {
        const notification = await this.prismaService.notification.create({
            data: {
                message: `<b className='font-medium>Congradulations</b> <p>Your channel has been verified</p>`,
                type: NotificationType.VERIFIED_CHANNEL,
                userId,
            }          
        })
        return notification;
    }

    public async changeSettings(
        user: User,
        imput: NotificationInput,
    ) {
        const { siteNotifications, telegramNotifications } = imput

        const notificationSettings = await this.prismaService.notificationSettings.upsert({
            where: {
                userId: user.id,
            },
            create: {
                siteNotifications,
                telegramNotifications,
                user: {
                    connect: {
                        id: user.id,
                    }
                }
            },
            update: {
                siteNotifications,
                telegramNotifications,
            },
            include: {
                user: true,
            }
        })

        const toSetTelegram = notificationSettings.telegramNotifications &&
        !notificationSettings.user.telegramId;
        const toRemoveTelegram = !notificationSettings.telegramNotifications && 
        notificationSettings.user.telegramId;

        if (toSetTelegram) {
            const telegramAuthToken = await generateTokenString(
                this.prismaService,
                user,
                TokenType.TELEGRAM_AUTH
            );

            return {
                notificationSettings,
                telegramAuthToken,
            }
        }

        if (toRemoveTelegram) {
            await this.prismaService.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    telegramId: null,
                }
            })
            return { notificationSettings }
        }
        return {
            notificationSettings,
        }
    }
}