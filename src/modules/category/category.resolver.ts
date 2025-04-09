import { Resolver, Query, Mutation, Args } from "@nestjs/graphql"

import { CategoryService } from './category.service'
import { CategoryModel } from './models/category.model'


@Resolver('Category')
export class CategoryResolver {
    public constructor (
        private readonly categoryService: CategoryService
    ) {}
    @Query(() => [CategoryModel], { name: 'findAllCategories' })
    public async findAllCategories() {
        return await this.categoryService.findAll()
    }

    @Query(() => CategoryModel, { name: 'findRandomCategory'} )
    public async findRandom() {
        return await this.categoryService.findRandom
    }

    @Query(() => CategoryModel, { name: 'findBySlug'} )
    public async findBySlug(@Args('slug') slug: string) {
        return await this.categoryService.findBySlug(slug)
    }
}