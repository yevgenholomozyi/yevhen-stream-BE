import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'


import { CronService } from './cron.service'
import { NotificationService } from '@/src/modules/notification/notification.service'
@Module({
    providers: [CronService, NotificationService]

})
export class CronModule {}
