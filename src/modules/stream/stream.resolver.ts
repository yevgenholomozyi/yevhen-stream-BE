import {
    Resolver,
    Query,
    Mutation,
    Args,
} from "@nestjs/graphql"

import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import * as Upload from 'graphql-upload/Upload.js'
import type { User } from '@/prisma/generated'

import { Authorized } from "@/src/shared/decorators/authorized.decorator"
import { Authorization } from "@/src/shared/decorators/auth.decorator"

import { ChangeStreamInfoInput } from './inputs/change-stream-info.input'
import { GenerateStreamTokenInput } from './inputs/generate-stream-token.input'
import { FiltersInput } from './inputs/filters.input'

import { GenerateStreamTokenModel } from './models/generate-stream-token.model'

import { StreamModel } from './models/stream.model'
import { FileValidationPipe } from "@/src/shared/pipes/file-validation.pipe"
import { StreamService } from './stream.service'

@Resolver('Stream')
export class StreamResolver {
    constructor(
        private readonly streamService: StreamService
    ) {}
    @Query(() => [StreamModel], { name: 'findAllStreams' })
    public async findAll(@Args('filters') input: FiltersInput) {
        return await this.streamService.findAll(input)
    }

    @Query(() => [StreamModel], { name: 'findAllStreams' })
    public async findRandom() {
        return await this.streamService.findRandom()
    }

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeStreamInfo' })
	public async changeInfo(
		@Authorized() user: User,
		@Args('data') input: ChangeStreamInfoInput
	) {
		return this.streamService.changeInfo(user, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeStreamThumbnail' })
	public async changeThumbnail(
		@Authorized() user: User,
		@Args('thumbnail', { type: () => GraphQLUpload }, FileValidationPipe)
		thumbnail: Upload
	) {
		return this.streamService.changeThumbnail(user, thumbnail)
	}

    @Mutation(() => GenerateStreamTokenModel, { name: 'generateStreamToken' })
	public async generateToken(@Args('data') input: GenerateStreamTokenInput) {
		return this.streamService.generateToken(input)
	}
}