import { Field, ID, ObjectType } from '@nestjs/graphql'

import type { ChatMessage } from '@/prisma/generated'

import { UserModel } from '../../auth/account/models/user.model'

const streamModel: any = 'fd'

@ObjectType()
export class ChatMessageModel implements ChatMessage {
	@Field(() => ID)
	id: string

	@Field(() => String)
	text: string

	@Field(() => UserModel)
	user: UserModel

	@Field(() => String)
	userId: string

	@Field(() => String)
	streamId: string

	@Field(() => Date)
	createdAt: Date

	@Field(() => Date)
	updatedAt: Date
}
