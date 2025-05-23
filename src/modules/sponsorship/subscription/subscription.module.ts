import { Module } from '@nestjs/common'
import { SubscriptionService } from './subscription.service'
import { SubscriptionResolver } from './subscription.resolver'

@Module({
    providers: [SubscriptionService, SubscriptionResolver]
})
export class SubscriptionModule {}
