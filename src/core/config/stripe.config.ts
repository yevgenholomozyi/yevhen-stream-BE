import { ConfigService } from '@nestjs/config'

import { TypeStripeOptions } from '@/src/shared/types/stripe.type'

export function getStripeConfig(configService: ConfigService): TypeStripeOptions {
    return {
        apiKey: configService.get('STRIPE_SECRET_KEY'),
        config: {
            apiVersion: '2024-10-28.acacia',
        }
    }
}

