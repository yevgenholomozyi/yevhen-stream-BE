import {
    Injectable,
    NotFoundException,
} from "@nestjs/common"
import { PrismaService } from '@/src/core/prisma/prisma.service'

@Injectable()
export class ChannelService {
    public constructor (
        private readonly prismaService: PrismaService
    ) {}

    public async findRecommended() {
        return await this.prismaService.user.findMany({
            where: {
                isDeactivated: false,           
            },
            orderBy: {
                followings: {
                    _count: 'asc'
                }
            },
            take: 7
        })
    }
    public async findChannelByUsername(username: string) {
        console.log('username', username);
        const channel = await this.prismaService.user.findUnique({
			where: {
				username,
				isDeactivated: false
			},
			include: {
				socialLinks: {
					orderBy: {
						position: 'asc'
					}
				},
				stream: {
					include: {
						category: true
					}
				},
				followings: true,
				sponsorshipPlans: true,
				sponsorshipSubscriptions: true
			}
		})

		if (!channel) {
			throw new NotFoundException('channel not found')
		}

		return channel
    }
    public async findFollowersCountByChannel(channelId: string) {
        const count = await this.prismaService.follow.count({
			where: {
				following: {
					id: channelId
				}
			}
		})

        return count;
    }
    public async findSponsorsByChannel(channelId: string) {
        const channel = await this.prismaService.user.findUnique({
            where: {
                id: channelId
            }
        })

        if (!channel) {
            throw new NotFoundException('We can not find a respective channel')
        }

        const sponsors = await this.prismaService.sponsorshipSubscription.findMany({
            where: {
                channelId: channel.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                plan: true,
                user: true,
                channel: true
            }
        })

    return sponsors
    }
}