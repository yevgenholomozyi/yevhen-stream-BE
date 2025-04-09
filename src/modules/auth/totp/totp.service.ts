import { BadRequestException, Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { encode } from 'hi-base32'
import { TOTP } from 'otpauth'
import * as QRCode from 'qrcode'

import type { User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { EnableTotpInput } from './inputs/enable-totp.input'

@Injectable()
export class TotpService {
    public constructor(
        private readonly prismaService: PrismaService
    ) {}

    public async generate(user?: User) {
        const secret = encode(randomBytes(15))
          .replace(/=/g, '')
          .substring(0, 24);
        
        const totp = new TOTP({
            issuer: 'YevhenStream',
            label: `${user.email}`,
            digits: 6,
            secret,
            algorithm: 'SHA1'
        });

        const otpauthUrl = totp.toString();
        const qrcodeUrl = await QRCode.toDataURL(otpauthUrl);
    
        return { qrcodeUrl, secret }
    }
    public async enable(user: User, input: EnableTotpInput) {
        const { secret, pin } = input;
        const totp = new TOTP({
            issuer: 'YevhenStream',
            label: `${user.email}`,
            digits: 6,
            secret,
            algorithm: 'SHA1'
        });

        const delta = totp.validate({ token: pin });
        if (!delta) {
            throw new BadRequestException('Wrong validation code')
        }

        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                isTotpEnabled: true,
                totpSecret: secret
            }
        })

        return true;
    }
    public async disable(user: User) {
        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                isTotpEnabled: false,
                totpSecret: null
            }
        });

        return true;
    }
}
