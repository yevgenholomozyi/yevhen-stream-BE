import { Module } from '@nestjs/common'

import { IngressResolver } from './ingress.resolver'
import { IngressService } from './ingress.service'

/* Ingress is an entrypoint into media stream to get it into LiveKit. */
@Module({
	providers: [IngressResolver, IngressService]
})
export class IngressModule {}
