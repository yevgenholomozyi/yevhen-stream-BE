import { ObjectType, Field } from "@nestjs/graphql";
import { UserModel } from "./user.model";

@ObjectType()
export class AuthModel {
    @Field(() => UserModel)
    user: UserModel

    @Field(() => String)
    message: string
}
