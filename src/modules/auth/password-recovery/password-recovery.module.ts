import { Module } from '@nestjs/common';

import { PasswrodRecoveryService } from './password-recovery.service';
import { PasswordRecoveryResolver } from './password.recovery.resolver';

@Module({
	providers: [PasswordRecoveryResolver, PasswrodRecoveryService]
})
export class PasswordRecoveryModule {}
