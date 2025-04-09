import { Context,
  Mutation,
  Resolver,
  Args
 } from '@nestjs/graphql'
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator'
import type { GqlContext } from '@/src/shared/types/graphql-context.type';
import { AuthModel } from '../account/models/auth.model'
import { VerificationInput } from './inputs/verification-input'
import { VerificationService } from './verification.service'


@Resolver()
export class VerificationResolver {
  constructor(private readonly verificationService: VerificationService) {}

  @Mutation(() => AuthModel, { name: 'verifyAccount' })
	public async verify(
		@Context() { req }: GqlContext,
		@Args('data') input: VerificationInput,
		@UserAgent() userAgent: string
	) {
		return this.verificationService.verify(req, input, userAgent)
	}
}
