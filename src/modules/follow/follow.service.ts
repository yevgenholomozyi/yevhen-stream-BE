import { Injectable, ConflictException } from "@nestjs/common"
import { NotificationService } from "../notification/notification.service"
import { PrismaService } from "../../core/prisma/prisma.service"
import { User } from '@/prisma/generated'

@Injectable()
export class FollowService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly notificationService: NotificationService
    ) {}
    public async findMyFollowers(user: User) {
        const followers = await this.prismaService.follow.findMany({
            where: {
                followingId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                follower: true
            }
        })

        return followers;
    }
    public async findMyFollowings(user: User) {
        const followings = await this.prismaService.follow.findMany({
			where: {
				followerId: user.id
			},
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				following: true
			}
		})

		return followings
    }
    public async follow(user: User, channelId: string) {
        const channel = await this.prismaService.user.findUnique({
            where: {
                id: channelId
            }
        })

        if (!channel) {
            throw new Error('Channel not found')
        }

        
		if (channel.id === user.id) {
			throw new ConflictException('Could not follow yourslef')
		}

        const existingFollow = await this.prismaService.follow.findFirst({
            where: {
                followerId: user.id,
                followingId: channel.id
            }
        })

        if (existingFollow) {
            throw new ConflictException('Already followed')
        }

        const follow = await this.prismaService.follow.create({
            data: {
                followerId: user.id,
                followingId: channel.id
            },
            include: {
                follower: true,
                following: {
                    include: {
                        notificationSettings: true
                    }
                }
            }
        })

        if (follow.following.notificationSettings.siteNotifications) {
			await this.notificationService.createNewFollowing(
				follow.following.id,
				follow.follower
			)
		}

        return true;
    }
    public async unfollow(user: User, channelId: string) {
        const channel = await this.prismaService.user.findUnique({
            where: {
                id: channelId
            }
        })

        if (!channel) {
            throw new Error('Channel not found')
        }

        const existingFollow = await this.prismaService.follow.findFirst({
            where: {
                followerId: user.id,
                followingId: channel.id
                
            }
        })

        if (!existingFollow) {
            throw new Error('Not following')
        }

        await this.prismaService.follow.delete({
            where: {
                id: existingFollow.id,
				followerId: user.id,
				followingId: channel.id
            }
        })

        return true;
    }
}