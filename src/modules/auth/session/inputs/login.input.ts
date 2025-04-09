import { Field, InputType } from '@nestjs/graphql'
import {
	IsNotEmpty,
	IsString,
    Length,
    IsOptional
} from 'class-validator'


@InputType()
export class LoginInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    login: string
  
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    password: string

    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    @Length(6, 6)
    pin: string
}