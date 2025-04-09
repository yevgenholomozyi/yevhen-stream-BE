import { Module } from "@nestjs/common";
import { ApolloDriver } from "@nestjs/apollo";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { PrismaModule } from "./prisma/prisma.module";
import { IS_DEV_ENV } from "../shared/utils/is-dev.util";

import { getGraphQLConfig } from './config/graphql.config'
import { getLiveKitConfig } from './config/livekit.config'
import { getStripeConfig } from './config/stripe.config'

import { RedisModule } from './redis/redis.module';
import { AccountModule } from "../modules/auth/account/account.module";
import { SessionModule } from "../modules/auth/session/session.module";
import { MailModule } from "../modules/libs/mail/mail.module";
import { VerificationModule } from "../modules/auth/verification/verification.module";
import { DeactivateModule } from "../modules/auth/deactivate/deactivate.module";
import { StorageModule } from '../modules/libs/storage/storage.module';
import { CategoryModule } from "../modules/category/category.module";
import { PasswordRecoveryModule } from '../modules/auth/password-recovery/password-recovery.module';
import { TotpModule } from '../modules/auth/totp/totp.module';
import { ChatModule } from "../modules/chat/chat.module";
import { StripeModule } from '../modules/libs/stripe/stripe.module';
import { NotificationModule } from '../modules/notification/notification.module';
import { CronModule } from "../modules/cron/cron.module";
import { ProfileModule } from "../modules/auth/profile/profile.module";
import { ChannelModule } from '../modules/channel/channel.module';
import { SubscriptionModule } from '../modules/sponsorship/subscription/subscription.module'
import { TransactionModule } from '../modules/sponsorship/transaction/transaction.module'
import { FollowModule } from '../modules/follow/follow.module'
import { PlanModule } from '../modules/sponsorship/plan/plan.module'
import { LivekitModule } from '../modules/libs/livekit/livekit.module'
import { StreamModule } from '../modules/stream/module.stream'
import { IngressModule } from '../modules/stream/ingress/ingress.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: !IS_DEV_ENV,
        }),
        GraphQLModule.forRootAsync({
            driver: ApolloDriver,
            imports: [ConfigModule],
            useFactory: getGraphQLConfig,
            inject: [ConfigService],
        }),
         // async registration for dynamic config
		LivekitModule.registerAsync({
			imports: [ConfigModule],
			useFactory: getLiveKitConfig, // register config
			inject: [ConfigService] // inject config service
		}),
        StripeModule.registerAsync({
			imports: [ConfigModule],
			useFactory: getStripeConfig,
			inject: [ConfigService]
		}),
        PrismaModule,
        RedisModule,
        AccountModule,
        SessionModule,
        MailModule,
        VerificationModule,
        DeactivateModule,
        StorageModule,
        PasswordRecoveryModule,
        TotpModule,
        StripeModule,
        NotificationModule,
        CronModule,
        ProfileModule,
        CategoryModule,
        ChatModule,
        ChannelModule,
        SubscriptionModule,
        TransactionModule,
        FollowModule,
        PlanModule,
        IngressModule,
        StreamModule
    ]
})
export class CoreModule {}
