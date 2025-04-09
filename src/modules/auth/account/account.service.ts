import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateUserInput } from './inputs/create-user.input';
import { ChangeEmailInput } from './inputs/change-email.input';
import { ChangePasswordInput } from './inputs/change-password.input';
import { hash, verify } from 'argon2'
import type { User } from '@/prisma/generated'
import { VerificationService } from '../verification/verification.service';

@Injectable()
export class AccountService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly verificationService: VerificationService
    ) {}
    public async me(id: string) {
        return this.prismaService.user.findUnique({
            where: {
                id
            },
            include: {
                socialLinks: true,
                stream: true,
                notificationSettings: true,
            }
        });
    }

    public async createUser(input: CreateUserInput) {
        const { email, password, username } = input;
        
        // check if user already exists
        const [existingUser, isEmailExists] = await Promise.all([
            this.prismaService.user.findUnique({ where: { username } }),
            this.prismaService.user.findUnique({ where: { email } }),
        ]);

        if (existingUser) {
            throw new ConflictException('This username is already taken')
        }

		if (isEmailExists) {
			throw new ConflictException('This email is already taken')
		}
  
        // if not, create a user
       const hashedPassword = await hash(password);
       try {
        const user = await this.prismaService.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                displayName: username,
                stream: {
					create: {
						title: `Stream ${username}`,
					}
				},
                notificationSettings: {
                    create: {}
                }
            }
           })

        await this.verificationService.sendVerficationToken(user);


       } catch (err) {
        throw new InternalServerErrorException('Failed to create user')
       }
       
       return true
    }

    public async changeEmail(user: User, input: ChangeEmailInput) {
        const { email } = input;

        try {
            await this.prismaService.user.update({
                where: {
                    id: user.id
                },
                data: {
                    email
                }
            })

        } catch {
            throw new InternalServerErrorException('Failed to change email')
        }

		return true
    }

    public async changePassword(user: User, input: ChangePasswordInput) {
        const { oldPassword, newPassword } = input;

        const isPasswordValid = await verify(user.password, oldPassword);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid old password')
        }
        
        const hashedPassword = await hash(newPassword);
        try {
            await this.prismaService.user.update({
                where: {
                    id: user.id
                },
                data: {
                    password: hashedPassword
                }
            })
        } catch {
            throw new InternalServerErrorException('Failed to change password')
        }

        return true
    }
}

