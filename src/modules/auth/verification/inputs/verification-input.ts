import { InputType, Field } from "@nestjs/graphql";
import {
	IsNotEmpty,
	IsString,
    IsUUID
} from 'class-validator'

@InputType()
export class VerificationInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @IsUUID('4')
    token: string
}
