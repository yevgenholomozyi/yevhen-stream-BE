import { Field, InputType } from '@nestjs/graphql'
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
	MinLength
} from 'class-validator'


@InputType()
export class CreateUserInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    username: string;
    @Field(() => String)
    @IsEmail()
    @IsNotEmpty()
    email: string
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string
}