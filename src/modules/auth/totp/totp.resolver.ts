import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import type { User } from '@/prisma/generated'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'

import { EnableTotpInput } from './inputs/enable-totp.input'
import { TotpModel } from './models/totp.model'
import { TotpService } from './totp.service'

@Resolver('Totp')
export class TotpResolver {
  constructor(private readonly totpService: TotpService) {}

 /*  @Authorization() */
  @Query(() => TotpModel, { name: 'generateTotpSecret' })
  public async generate(
   /*  @Authorized() *//*  user: User */
  ) {
    return this.totpService.generate()
  }

/*   @Authorization() */
  @Mutation(() => Boolean, { name: 'enableTotpSecret' })
  public async enable(
/*     @Authorized() */ user: User,
    @Args('data') input: EnableTotpInput
  ) {
    return this.totpService.enable(user, input)
  }

/*   @Authorization() */
  @Mutation(() => Boolean, { name: 'disableTotp' })
  public async disalbe(
   /*  @Authorized() */ user: User
  ) {
    return this.totpService.disable(user)
  }
}
