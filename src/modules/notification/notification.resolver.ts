
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { NotificationService } from './notification.service';
import type { User } from '@/prisma/generated'
import { ChangeNotificationsSettingsResponse } from './models/notification-settings.model'
import { NotificationModel } from './models/notification.model'
import { NotificationInput } from './inputs/notification.input'

@Resolver('Notification')
export class NotificationResolver {
    public constructor(
        private readonly notificationService: NotificationService,
    ) {}

    @Authorization()
    @Query(() => Number, { name: 'findNotificationsUnreadCount' })
    public async findUnreadCount(@Authorized() user: User) {
        return this.notificationService.findUnreadCount(user);
    }

    @Authorization()
    @Query(() => [NotificationModel], { name: 'findNotificationsByUser' })
    public async findByUser(@Authorized() user: User) {
        return this.notificationService.findByUser(user);
    }

    @Authorization()
    @Mutation(() => ChangeNotificationsSettingsResponse, {
        name: 'changeNotificationsSettings'
    })
    public async changeSettings(
        @Authorized() user: User,
		@Args('data') input: NotificationInput
    ) {
        return this.notificationService.changeSettings(user, input);
    }
}