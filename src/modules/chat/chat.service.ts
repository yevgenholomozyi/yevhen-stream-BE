import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { User } from "@/prisma/generated";
import { PrismaService } from "@/src/core/prisma/prisma.service";

import { ChangeChatSettingsInput } from './inputs/change-chat-settings.input'
import { ChatNotificationInput } from './inputs/chat-notification.input'

@Injectable()
export class ChatService {
    public constructor(
        private readonly prismaService: PrismaService
    ) {}

    public async findByStream(streamId: string) {
        const messages = await this.prismaService.chatMessage.findMany({
			where: {
				streamId
			},
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				user: true
			}
		})

		return messages
    }

    public async sendMessage (userId: string, input: ChatNotificationInput) {
        const { text, streamId } = input;
        const stream = await this.prismaService.stream.findUnique({
            where: {
                id: streamId
            }
        })

        if (!stream) {
            throw new BadRequestException('Stream not found')
        }
        if (!stream.isLive) {
            throw new BadRequestException('This stream is not live')
        }

        const message = await this.prismaService.chatMessage.create({
			data: {
				text,
				user: {
					connect: {
						id: userId
					}
				},
				stream: {
					connect: {
						id: stream.id
					}
				}
			},
			include: {
				stream: true,
				user: true
			}
		})

        return message;
    }

    public async changeChatSettings (user: User, input: ChangeChatSettingsInput) {
        const {
            isChatEnabled,
            isChatFollowersOnly,
            isChatPremiumFollowersOnly
        } = input;

        await this.prismaService.stream.update({
            where: {
                userId: user.id
            },
            data: {
                isChatEnabled,
                isChatPremiumFollowersOnly,
                isChatFollowersOnly
            }
        })
        return true
    }
}