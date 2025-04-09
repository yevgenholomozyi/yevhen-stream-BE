import type { MailerOptions } from '@nestjs-modules/mailer';
import type { ConfigService } from '@nestjs/config';

export const getMailerConfig = (configService: ConfigService): MailerOptions => ({
    transport: {
        host: configService.getOrThrow<string>('MAIL_HOST'),
        port: configService.getOrThrow<number>('MAIL_PORT'),
        secure: configService.getOrThrow<string>('MAIL_SECURE') === 'true',
        auth: {
            user: configService.getOrThrow<string>('MAIL_LOGIN'),
            pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
        }
    },
    defaults: {
        from: `y.holomozyi@gmail.com ${configService.getOrThrow<string>('MAIL_LOGIN')}`
    }
        
});
