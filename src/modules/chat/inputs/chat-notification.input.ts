import { Field, InputType, } from "@nestjs/graphql"
import { IsNotEmpty, IsString } from 'class-validator'

@InputType()
export class ChatNotificationInput {
    @Field(() => String)
    @IsNotEmpty()
    @IsString()
   streamId: string

   @Field(() => String)
   @IsNotEmpty()
   @IsString()
   text: string
}