import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from '@nestjs/schedule'

import { PrismaService } from "@/src/core/prisma/prisma.service";
import { StorageService } from '../libs/storage/storage.service';
import { MailService } from "../libs/mail/mail.service";
import { NotificationService } from '@/src/modules/notification/notification.service'

@Injectable()
export class CronService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly mailService: MailService,
        private readonly storageService: StorageService,
        private readonly notificationService: NotificationService
    ) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    public async deleteDeactivatedAccounts() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(
            sevenDaysAgo.getSeconds() - 10
        )

        const deactivatedAccounts = await this
        .prismaService
        .user
        .findMany({
            where: {
                isDeactivated: true,
                deactivatedAt: {
                    lte: sevenDaysAgo
                }
            },
            include: {
                notificationSettings: true,
                stream: true
            }
        })

        for (const account of deactivatedAccounts) {
            await this.mailService.sendAccountDeletion(account.email)

            
			if (account.avatar) {
				this.storageService.remove(account.avatar)
			}

            if (account.stream.thumbnailUrl) {
				this.storageService.remove(account.stream.thumbnailUrl)
			}

        }

        await this.prismaService.user.deleteMany({
            where: {
                isDeactivated: true,
                deactivatedAt: {
                    lte: sevenDaysAgo
                }
            }
        })
    }

    @Cron('0 0 * * 1')
    public async notifyUserEnableTwoFactor() {   
        const users = await this.prismaService.user.findMany({
			where: {
				isTotpEnabled: false
			},
			include: {
				notificationSettings: true
			}
		})

        for (const user of users) {
            await this.mailService.sendEnableTwoFactor(
                user.email
            )

            if (user.notificationSettings.siteNotifications) {
                await this.notificationService.createEnableTwoFactor(user.id)
            }

            if (user.notificationSettings.telegramNotifications && 
                user.telegramId
            ) {
                console.log('implement telegram service')
/*                 await this.telegramService.sendEnableTwoFactor(user.telegramId)
 */            }
        }
        
    }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    public async verifyChannels() {
        const users = await this.prismaService.user.findMany({
            include: {
                notificationSettings: true
            }
        })

        for (const user of users) {
            const followersCount = await this.prismaService.follow.count({
                where: {
                    followingId: user.id
                }
            })

            if (followersCount > 2 && !user.isVerified) {
                await this.prismaService.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        isVerified: true
                    }
                })

                await this.mailService.sendVerifyChannel(user.email)

                if (user.notificationSettings.siteNotifications) {
					await this.notificationService.createVerifyChannel(user.id)
				}
            }
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
	public async deleteOldNotifications() {
		const sevenDaysAgo = new Date()
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

		await this.prismaService.notification.deleteMany({
			where: {
				createdAt: {
					lte: sevenDaysAgo
				}
			}
		})
	}
}