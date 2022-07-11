import { ObjectType, Field } from "type-graphql";
import { FieldError } from "./FieldError";
import { IMutationResponse } from "./MutationResponse";
import { Post } from "../entities/Post";

@ObjectType({ implements: IMutationResponse })
export class PostMutationResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field({ nullable: true })
  post?: Post;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
