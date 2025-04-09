import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import type { User } from '@/prisma/generated'
import { AccountService } from './account.service';
import { CreateUserInput } from './inputs/create-user.input';
import { ChangeEmailInput } from './inputs/change-email.input';
import { ChangePasswordInput } from './inputs/change-password.input';
import { UserModel } from './models/user.model';
import { Authorized } from '../../../shared/decorators/authorized.decorator';
import { Authorization } from '../../../shared/decorators/auth.decorator';

@Resolver(() => UserModel)
export class AccountResolver {
  public constructor(private readonly accountService: AccountService) {}

  @Authorization()
  @Query(() => UserModel, { name: 'findProfile' })
  public async me(@Authorized('id') id: string) {
    return this.accountService.me(id);
  }

  @Mutation(() => Boolean, { name: 'createUser' })
  public async create(@Args('data') input: CreateUserInput) {
    return this.accountService.createUser(input);
  }

	@Authorization()
  @Mutation(() => Boolean, { name: 'changeEmail' })
  public async changeEmail(
    @Authorized() user: User,
    @Args('data')input: ChangeEmailInput
  ) {
    return this.accountService.changeEmail(user, input);
  }
  
	@Authorization()
  @Mutation(() => Boolean, { name: 'changePassword' })
  public async ChangePassword(
    @Authorized()user: User,
    @Args('data') input: ChangePasswordInput
  ) {
    return this.accountService.changePassword(user, input)
  }
}
