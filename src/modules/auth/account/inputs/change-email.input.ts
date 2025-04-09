import { Field, InputType } from '@nestjs/graphql'
import {
	IsEmail,
	IsNotEmpty,
	IsString,
} from 'class-validator'


@InputType()
export class ChangeEmailInput {
    @Field(() => String)
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string

}