import { Post } from "../entities/Post";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class PaginatedPosts {
  @Field()
  totalCount!: number;

  @Field()
  cursor!: number;

  @Field()
  hasMore!: boolean;

  @Field(() => [Post])
  paginatedPosts!: Post[];
}
