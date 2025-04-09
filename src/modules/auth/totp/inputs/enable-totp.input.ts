import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString, Length } from 'class-validator'

@InputType()
export class EnableTotpInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	public secret: string

	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	@Length(6, 6)
	public pin: string
}
