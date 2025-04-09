import {
    Resolver,
    Subscription,
    Mutation,
    Query,
    Args,
} from "@nestjs/graphql"

import { PubSub } from 'graphql-subscriptions'

import { User } from '@/prisma/generated'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'

import { ChangeChatSettingsInput } from './inputs/change-chat-settings.input'
import { ChatNotificationInput } from './inputs/chat-notification.input'

import { ChatMessageModel } from "./models/chat-message.model"
import { ChatService } from './chat.service'

@Resolver('Chat')
export class ChatResolver {
    private readonly pubSub: PubSub
    public constructor (
        private readonly chatService: ChatService
    ) {
        this.pubSub = new PubSub()
    }

    @Query(() => [ChatMessageModel], { name: 'findChatMessagesByStream' })
	public async findByStream(@Args('streamId') streamId: string) {
		return this.chatService.findByStream(streamId)
	}
 
	@Authorization()
	@Mutation(() => ChatMessageModel, { name: 'sendChatMessage' })
	public async sendMessage(
		@Authorized('id') userId: string,
		@Args('data') input: ChatNotificationInput
	) {
		const message = await this.chatService.sendMessage(userId, input)

		this.pubSub.publish('CHAT_MESSAGE_ADDED', { chatMessageAdded: message })

		return message
	}
    
	@Subscription(() => ChatMessageModel, {
		name: 'chatMessageAdded',
		// send message to a chat with only this streamId
		filter: (payload, variables) =>
			payload.chatMessageAdded.streamId === variables.streamId
	})
	public chatMessageAdded(@Args('streamId') streamId: string) {
		return this.pubSub.asyncIterableIterator('CHAT_MESSAGE_ADDED')
	}

    @Authorization()
    @Mutation(() => Boolean, { name: 'changeChatSettings'} )
    public async changeChatSettings (
        @Authorized() user: User,
        @Args('data') input: ChangeChatSettingsInput
    ) {
        return await this.chatService.changeChatSettings(user, input)
    }
}