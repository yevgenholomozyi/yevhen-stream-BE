import { ConflictException, Injectable } from '@nestjs/common'
import * as Upload from 'graphql-upload/Upload.js'
import * as sharp from 'sharp'

import type { User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

import { StorageService } from '../../libs/storage/storage.service'

import { ChangeProfileInfoInput } from './inputs/change-profile-info.input'
import {
	SocialLinkInput,
	SocialLinkOrderInput
} from './inputs/social-link.input'
import { processFileUpload } from './utils/processFileUpload.util'


export class ProfileService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly storageService: StorageService
    ) {}

    public async changeAvatar(user: User, file: Upload) {
        if (user.avatar) {
            await this.storageService.remove(user.avatar)
        }

        const chunks: Buffer[] = [];

        for await (const chunk of file.createReadStream()) {
            chunks.push(chunk)
        }

        const buffer = Buffer.concat(chunks)

        const fileName = `/channels/${user.username}.webp`

        await processFileUpload(fileName, this.storageService, file, buffer)

        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                avatar: fileName
            }
        })
    
        return true
    }

    public async removeAvatar(user: User) {
        if (!user.avatar) return;
        await this.storageService.remove(user.avatar)
        await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				avatar: null
			}
		})

        return true;
    }

    public async changeInfo(user: User, input: ChangeProfileInfoInput) {
        const { username, bio, displayName } = input;
        const userNameExists = await this.prismaService.user.findUnique({
            where: {
                username
            }
        })

        if (userNameExists && username !== user.username) {
			throw new ConflictException('This username is already taken')
		}

        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                username,
                displayName,
                bio
            }
        })

        return true;     
    }

    public async findSocialLinks(user: User) {
        const socialLinks = await this.prismaService.socialLink.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                position: 'asc'
            }
        })

        return socialLinks
    }

    public async createSocialLink(user: User, input: SocialLinkInput) {
        const { title, url } = input;

        const lastSocialLink = await this.prismaService.socialLink.findFirst({
			where: {
				userId: user.id
			},
			orderBy: {
				position: 'desc'
			}
		})

        const newPosition = lastSocialLink ? lastSocialLink.position + 1 : 1;

        await this.prismaService.socialLink.create({
            data: {
                title,
                url,
                position: newPosition,
                user: {
                    connect: {
                        id: user.id
                    }
                }
                
            }
        })

        return true
    }

    public async updateSocialLink(id: string, input: SocialLinkInput) {
        const { title, url } = input;

        await this.prismaService.socialLink.update({
            where: {
                id
            },
            data: {
                title,
                url
            }
        })    

        return true;
    }

    public async removeSocialLink(id: string) {
        await this.prismaService.socialLink.delete({
            where: {
                id
            }
        })

        return true;
    }

    public async reorderSocialLinks(list: SocialLinkOrderInput[]) {
		if (!list.length) {
			return
		}

		const updatePromises = list.map(socialLink => {
			return this.prismaService.socialLink.update({
				where: {
					id: socialLink.id
				},
				data: {
					position: socialLink.position
				}
			})
		})

		await Promise.all(updatePromises)

		return true
	}
}