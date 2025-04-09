import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { GqlContext } from 'src/shared/types/graphql-context.type';

import { Authorization } from '../../../shared/decorators/auth.decorator';
import { SessionService } from './session.service';
import { LoginInput } from './inputs/login.input';
import { UserModel } from '@/src/modules/auth/account/models/user.model';
import { AuthModel } from '@/src/modules/auth/account/models/auth.model';
import { UserAgent } from '../../../shared/decorators/user-agent.decorator';
import { SessionModel } from './models/session.model';

@Resolver()
export class SessionResolver {
  constructor(private readonly sessionService: SessionService) {}

  @Authorization()
  @Query(() => SessionModel, { name: 'currentSession' })
  public async findCurrent(@Context() { req }: GqlContext) {
    return this.sessionService.FindCurrent(req);
  }

  @Authorization()
  @Query(() => [SessionModel], { name: 'sessions' })
  public async findByUser(@Context() { req }: GqlContext) {
    return this.sessionService.findByUser(req);
  }

  @Mutation(() => AuthModel, { name: 'login' })
  public async login(
    @Context() { req }: GqlContext,
    @Args('data') input: LoginInput,
    @UserAgent() userAgent: string,
  ) {
    return this.sessionService.login(req, input, userAgent)
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'logout' })
  public async logout(@Context() { req }: GqlContext) {
    return this.sessionService.logout(req)
  }

  @Mutation(() => Boolean, { name: 'clearSessionCookie' })
	public async clearSession(@Context() { req }: GqlContext) {
		return this.sessionService.clearSession(req)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'removeSession' })
	public async remove(
		@Context() { req }: GqlContext,
		@Args('id') id: string
	) {
		return this.sessionService.remove(req, id)
	}
}
