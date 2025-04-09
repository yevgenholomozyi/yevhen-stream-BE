import {
    Resolver,
    Query,
    Mutation,
    Args
} from "@nestjs/graphql"
import { TransactionService } from "./transaction.service"

import type { User } from "@/prisma/generated"
import { TransactionModel } from "./models/transaction.model"
import { MakePaymentModel } from "./models/make-payment.model"
import { Authorized } from "@/src/shared/decorators/authorized.decorator"
import { Authorization } from "@/src/shared/decorators/auth.decorator"

@Resolver()
export class TransactionResolver {
    public constructor(private readonly transactionService: TransactionService) {}

    @Authorization()
    @Query(() => [TransactionModel], { name: 'getMyTransactions' })
    public async findMyTransactions(
        @Authorized() user: User
    ) {
        return await this.transactionService.getMyTransactions(user)
    }

    @Authorization()
    @Mutation(() => MakePaymentModel, { name: 'makePayment' })
    public async makePayment(
        @Authorized() user: User,
        @Args('planId') planId: string
    ) {
        return await this.transactionService.makePayment(user, planId)
    }
}
