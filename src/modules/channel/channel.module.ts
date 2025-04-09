import { Module } from "@nestjs/common"
import { ChannelService } from './channel.service'
import { ChannelResovler } from './channel.resolver'

@Module({
    providers: [ChannelService, ChannelResovler]
})
export class ChannelModule {}
