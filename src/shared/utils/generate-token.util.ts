import { v4 as uuidv4 } from 'uuid'

import { TokenType, type User } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'

export async function generateToken(
	prismaService: PrismaService,
	user: User,
	type: TokenType,
	isUUID: boolean = true
) {
	let token: string;
	if (isUUID) {
		token = uuidv4();
	} else {
		token = Math.floor(
			Math.random() * (1000000 - 100000) + 100000
		).toString()
	}
	const expiresIn = new Date(new Date().getTime() + 300000);
	const dbToken = await prismaService.token.findFirst({
		where: {
			type,
			user: {
				id: user.id
			}
		}
	});

	if (dbToken) {
		await prismaService.token.delete({
			where: {
				id: dbToken.id
			}
		})
	}

	const newToken = await prismaService.token.create({
		data: {
			token,
			expiresIn,
			type,
			user: {
				connect: {
					id: user.id
				}
			},
		},
		include: {
			user: {
				include: {
					notificationSettings: true
				}
			}
		}
	});
			

	return newToken;
};

export async function generateTokenString(
	prismaService: PrismaService,
	user: User,
	type: TokenType,
	isUUID: boolean = true,
) {
	const result = await generateToken(
		prismaService,
		user,
		type,
		isUUID
	);

	return result.token;
}