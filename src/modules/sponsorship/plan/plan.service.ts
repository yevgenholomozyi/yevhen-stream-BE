import { Injectable, NotFoundException } from "@nestjs/common"

import { PrismaService } from "@/src/core/prisma/prisma.service"
import { User } from "@/prisma/generated"
import { CreatePlanInput } from './inputs/create-plan.input'
import { StripeService } from "@/src/modules/libs/stripe/stripe.service"

@Injectable()
export class PlanService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly stripeService: StripeService
    ) {}

    public async findMyPlans(user: User) {
        return await this.prismaService.sponsorshipPlan.findMany({
            where: {
                channelId: user.id
            }
        })
    }
    public async create(
        user: User,
        input: CreatePlanInput

    ) {
        const { title, description, price } = input

        const channel = await this.prismaService.user.findUnique({
            where: {
                id: user.id
            }
        })

        if (!channel) {
            throw new NotFoundException('Channel not found')
        }

        const stripePlan = await this.stripeService.plans.create({
			amount: price,
			currency: 'usd',
			interval: 'month',
			product: {
				name: title
			}
		})

        await this.prismaService.sponsorshipPlan.create({
			data: {
				title,
				description,
				price,
				stripeProductId: stripePlan.product.toString(),
				stripePlanId: stripePlan.id,
				channel: {
					connect: {
						id: user.id
					}
				}
			}
		})
        return true
    }
    public async remove(planId: string) {
        const plan = await this.prismaService.sponsorshipPlan.findUnique({
			where: {
				id: planId
			}
		})

		if (!plan) {
			throw new NotFoundException('План не найден')
		}

		await this.stripeService.plans.del(plan.stripePlanId)
		await this.stripeService.products.del(plan.stripeProductId)

		await this.prismaService.sponsorshipPlan.delete({
			where: {
				id: plan.id
			}
		})

		return true
    }
}