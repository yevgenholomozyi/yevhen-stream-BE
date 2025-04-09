import { BadRequestException, Injectable } from '@nestjs/common'
import {
	CreateIngressOptions,
	IngressAudioEncodingPreset,
	IngressInput,
	IngressVideoEncodingPreset
} from 'livekit-server-sdk'

import type { User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

import { LivekitService } from '@/src/modules/libs/livekit/livekit.service'


@Injectable()
export class IngressService {
    public constructor(
		private readonly prismaService: PrismaService,
		private readonly livekitService: LivekitService
	) {}

    /* Create an inbound stream (ingress) via Livekit, 
    associatie with a user and save it to the DB */
    public async create(user: User, input: IngressInput) {
        await this.resetIngress(user)

        const options: CreateIngressOptions = {
            name: user.username,
            roomName: user.id,
            participantIdentity: user.id,
            participantName: user.username,
        }

        if (input === IngressInput.WHIP_INPUT) {
            options.bypassTranscoding = true
        } else {
            options.video = {
                source: 1,
				preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS
            }

            options.audio = {
                source: 2,
				preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS
            }
        }

        const ingress = await this.livekitService.ingress.createIngress(
            input,
            options
        )

		if (!ingress || !ingress.url || !ingress.streamKey) {
			throw new BadRequestException('We could not create an ingress')
		}

        await this.prismaService.stream.update({
			where: {
				userId: user.id
			},
			data: {
				ingressId: ingress.ingressId,
				serverUrl: ingress.url,
				streamKey: ingress.streamKey
			}
		})

		return true
    }
    /* Reset all ingress for a user */
    public async resetIngress(user: User) {
        const ingresses = await this
          .livekitService
          .ingress
          .listIngress({
			roomName: user.id
		  })

        const rooms = await this.livekitService.room.listRooms([user.id])

        for (const room of rooms) {
            await this.livekitService.room.deleteRoom(room.name)
        }

        for (const ingress of ingresses) {
            if(ingress.ingressId) {
                await this
                  .livekitService
                  .ingress
                  .deleteIngress(ingress.ingressId)
            }
        }

    }
}