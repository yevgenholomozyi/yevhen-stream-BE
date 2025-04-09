import { BadRequestException } from "@nestjs/common";
import { User } from 'prisma/generated';
import { TOTP } from 'otpauth';

export function checkTOTP(pin: string, user: User) {
    if (!pin) {
        return {
            message: 'You need a pin to login'
        }
    }
    const totp = new TOTP({
        issuer: 'YevhenStream',
        label: `${user.email}`,
        algorithm: 'SHA1',
        digits: 6,
        secret: user.totpSecret
    })

    const delta = totp.validate({ token: pin })

    if (delta === null) {
        throw new BadRequestException('Неверный код')
    }
}