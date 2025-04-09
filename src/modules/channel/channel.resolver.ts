import { Args, Query, Resolver } from '@nestjs/graphql'

import { UserModel } from '../auth/account/models/user.model'
import { SubscriptionModel } from '../sponsorship/subscription/models/subscription.model'

import { ChannelService } from './channel.service'

@Resolver('Channel')
export class ChannelResovler {
    public constructor(
        private readonly channelService: ChannelService
    ) {}
    
    @Query(() => [UserModel], { name: 'findRecommendedChannels' })
    async findRecommended() {
        return await this.channelService.findRecommended()
    }

    @Query(() => UserModel, { name: 'findChannelByUsername' })
    async findChannelByUsername(
        @Args('username') username: string
    ) {
        console.log('username in resolver is ', username)
        console.log(this.channelService)
        return await this.channelService.findChannelByUsername(username)
    }

    @Query(() => Number, { name: 'findFollowersCountByChannel' })
    async findFollowersCountByChannel(
        @Args('channelId') channelId: string
    ) {
        return await this.channelService.findFollowersCountByChannel(channelId)
    }

    @Query(() => [SubscriptionModel], { name: 'findSponsorsByChannel' })
    public async findSponsorsByChannel(@Args('channelId') channelId: string) {
        return await this.channelService.findSponsorsByChannel(channelId)
    }
}