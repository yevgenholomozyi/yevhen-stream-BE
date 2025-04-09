import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { PasswrodRecoveryService } from './password-recovery.service';
import { GqlContext } from 'src/shared/types/graphql-context.type';
import { NewPasswordInput } from './inputs/new-password.input';
import { ResetPasswordInput } from './inputs/reset-password.input';
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator';

@Resolver()
export class PasswordRecoveryResolver {
  constructor(private readonly passwordRecoveryService: PasswrodRecoveryService) {}

  @Mutation(() => Boolean, { name: 'resetPassword' })
  public async resetPassword(
    @Context() { req }: GqlContext,
    @Args('data') input: ResetPasswordInput,
    @UserAgent() userAgent: string
  ) {
    return this.passwordRecoveryService.resetPassword(req, input, userAgent)
  }

  @Mutation(() => Boolean, { name: 'newPassword' })
  public async newPassword(
    @Context() { req }: GqlContext,
    @Args('data') input: NewPasswordInput,
  ) {
    return this.passwordRecoveryService.newPassword(req, input)
  }
}
