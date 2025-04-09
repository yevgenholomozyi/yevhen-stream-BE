import { Module } from '@nestjs/common';
import { DeactivateService } from './deactivate.service';
import { DeactivateResolver } from './deactivate.resolver';

@Module({
    providers: [DeactivateService, DeactivateResolver],
})
export class DeactivateModule {}
