import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { UserModel } from '../../auth/account/models/user.model'
import { NotificationType } from "@prisma/generated";

registerEnumType(NotificationType, {
	name: 'NotificationType'
})

@ObjectType()
export class NotificationModel {
    @Field(() => Boolean)
    public isRead: boolean

    @Field(() => String)
    public message: string

    @Field(() => String)
    public id: string

    @Field(() => NotificationType)
    public type: NotificationType

    @Field(() => Date)
    public createdAt: Date

    @Field(() => Date)
    public updatedAt: Date

    @Field(() => UserModel)
	public user: UserModel

    @Field(() => String)
	public userId: string
}