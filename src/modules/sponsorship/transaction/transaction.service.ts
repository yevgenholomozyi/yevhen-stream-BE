import {
    Injectable,
    NotFoundException,
    ConflictException
} from "@nestjs/common"
import { PrismaService } from "@/src/core/prisma/prisma.service"
import { ConfigService } from "@nestjs/config"
import { StripeService } from "@/src/modules/libs/stripe/stripe.service"

import type { User } from '@/prisma/generated'

@Injectable()
export class TransactionService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly stripeService: StripeService

    ) {}

    public async getMyTransactions(user: User) {
        return this.prismaService.transaction.findMany({
            where: {
                userId: user.id
            }
        })
    }

    public async makePayment(user: User, planId: string) {
        const plan = await this.prismaService.sponsorshipPlan.findUnique({
            where: {
                id: planId
            },
            include: {
                channel: true
            }
        })

        if (!plan) {
            throw new NotFoundException('Plan not found')
        }

        if (user.id === plan.channel.id) {
            throw new ConflictException(
                'You cannot sponsor yourself'
            )
        }

        const existingSubscription =
            await this.prismaService.sponsorshipSubscription.findFirst({
                where: {
                    userId: user.id,
                    channelId: plan.channel.id
                }
            })

        if (existingSubscription) {
            throw new ConflictException(
                'You already have a sponsorship subscription for this channel'
            )
        }

        const customer = await this.stripeService.customers.create({
            name: user.username,
            email: user.email
        })

        const successUrl = `${this.configService.getOrThrow<string>('ALLOWED_ORIGIN')}/success?price=${encodeURIComponent(plan.price)}&username=${encodeURIComponent(plan.channel.username)}`
        const cancelUrl = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')

        const session = await this.stripeService.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: plan.title
                        },
                        unit_amount: Math.round(plan.price),
                        recurring: {
                            interval: 'month'
                        }
                    },
                    quantity: 1
                }
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer: customer.id,
            metadata: {
                planId: plan.id,
                userId: user.id,
                channelId: plan.channel.id
            }

        })

        await this.prismaService.transaction.create({
            data: {
                amount: plan.price,
                currency: session.currency,
                stripeSubscriptionId: session.id,
                user: {
					connect: {
						id: user.id
					}
				}
            }
        })

        return {
            url: session.url
        }

    }
}