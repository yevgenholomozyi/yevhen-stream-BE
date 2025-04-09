import {
    Resolver,
    Mutation,
    Args
} from "@nestjs/graphql"
import { User } from "@/prisma/generated"

import { Authorization } from "@/src/shared/decorators/auth.decorator"
import { Authorized } from "@/src/shared/decorators/authorized.decorator"
import { IngressService } from "./ingress.service"
import { IngressInput } from "livekit-server-sdk"

@Resolver('Ingress')
export class IngressResolver {
    constructor(
        private readonly ingressService: IngressService
    ) {}

    @Authorization()
	@Mutation(() => Boolean, { name: 'createIngress' })
	public async create(
		@Authorized() user: User,
		@Args('ingressType') ingressType: IngressInput
	) {
		return this.ingressService.create(user, ingressType)
	}
}

