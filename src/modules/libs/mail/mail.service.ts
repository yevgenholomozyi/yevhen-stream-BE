import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components';
import { VerificationTemplate } from './templates/verification.template';
import { VerifyChannelTemplate } from './templates/verify-channel.template';
import { ResetPasswordTemplate } from './templates/reset-password.template';
import { EnableTwoFactorTemplate } from './templates/two-factor.template';
import { DeactivateTemplate } from './templates/deactivate.template';
import { AccountDeletionTemplate } from './templates/account-deletion.template';

import { type SessionMetadata } from '@/src/shared/types/session-metadata.type'


@Injectable()
export class MailService {
    public constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
    ) {}

    public async sendVerificationToken(email: string, token: string) {
        const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
        const html = await render(VerificationTemplate({ domain, token }));
        return this.sendMail(email, 'Account Verification', html)
    }

    public async sendEnableTwoFactor(email: string) {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const html = await render(EnableTwoFactorTemplate({ domain }))

		return this.sendMail(email, 'Ensure your account security', html)
	}
    public async sendVerifyChannel(email: string) {
        const html = await render(VerifyChannelTemplate())

        return this.sendMail(email, 'Your channel is verified', html)
    }
    public async sendPasswordResetToken(
		email: string,
		token: string,
		metadata: SessionMetadata
	) {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const html = await render(
			ResetPasswordTemplate({ domain, token, metadata })
		)

		return this.sendMail(email, 'Password Reset', html)
	}

    public async deactivate(email: string, token: string, metadata: SessionMetadata) {
        const html = await render (
            DeactivateTemplate({ token, metadata })
        )

       return this.sendMail(email, 'Account Deactivate', html);
    }

    public async sendAccountDeletion(email) {
        const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
        const html = await render(
			AccountDeletionTemplate({ domain })
		)
        return this.sendMail(email, 'Password Reset', html)

    }

    private sendMail(email: string, subject: string, template: string) {
        return this.mailerService.sendMail({
            to: email,
            subject,
            html: template
        });
    }
}   