import {
  Mutation,
  Resolver,
  Arg,
  Query,
  ID,
  UseMiddleware,
  FieldResolver,
  Root,
  Int,
  Ctx,
} from "type-graphql";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { CreatePostInput, UpdatePostInput } from "../types/PostInput";
import { Post } from "../entities/Post";
import { checkAuth } from "../middleware/checkAuth";
import { User } from "../entities/User";
import { PaginatedPosts } from "../types/PaginatedPosts";
import { FindManyOptions } from "typeorm";
import { Context } from "../types/Context";

@Resolver(() => Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 100);
  }

  @FieldResolver(() => User)
  async user(@Root() root: Post) {
    return await User.findOne(root.uid);
  }

  @UseMiddleware(checkAuth)
  @Mutation(() => PostMutationResponse)
  async createPost(
    @Arg("createPostInput") { title, text }: CreatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const post = Post.create({
        title,
        text,
        uid: req.session.uid,
      });
      await post.save();
      return {
        code: 200,
        success: true,
        message: "Post created successfully",
        post,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: "Error creating post",
      };
    }
  }

  @Query(() => PaginatedPosts, { nullable: true })
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => Int, { nullable: true }) cursor?: number
  ): Promise<PaginatedPosts | null> {
    try {
      const totalPosts = await Post.count();
      const realLimit = Math.min(15, limit, totalPosts);

      //sort createdAt desc
      const options: FindManyOptions<Post> = {
        order: {
          createdAt: "DESC",
        },
        take: realLimit,
        skip: cursor ? limit * cursor : 0,
      };
      const posts = await Post.find(options);

      return {
        totalCount: totalPosts,
        cursor: cursor ? cursor + 1 : 1,
        hasMore: cursor
          ? (cursor + 1) * realLimit < totalPosts
          : posts.length !== totalPosts,
        paginatedPosts: posts,
      };
    } catch (error) {
      return null;
    }
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => ID) id: number): Promise<Post | undefined> {
    try {
      return await Post.findOne(id);
    } catch (error) {
      return undefined;
    }
  }

  @UseMiddleware(checkAuth)
  @Mutation(() => PostMutationResponse)
  async updatePost(
    @Arg("updatePostInput") { id, title, text }: UpdatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const post = await Post.findOne(id);
      if (!post) {
        return {
          code: 400,
          success: false,
          message: "Post not found",
        };
      }
      if (post.uid !== req.session.uid) {
        return {
          code: 401,
          success: false,
          message: "Unauthorized",
        };
      }
      post.title = title;
      post.text = text;
      await post.save();
      return {
        code: 200,
        success: true,
        message: "Updated successfully",
        post,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: "Error updating post",
      };
    }
  }

  @UseMiddleware(checkAuth)
  @Mutation(() => PostMutationResponse)
  async deletePost(
    @Arg("id", () => ID) id: number,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const post = await Post.findOne(id);
      if (!post) {
        return {
          code: 400,
          success: false,
          message: "Post not found",
        };
      }
      if (post.uid !== req.session.uid) {
        return {
          code: 401,
          success: false,
          message: "Unauthorized",
        };
      }
      await Post.delete(id);
      return {
        code: 200,
        success: true,
        message: "Deleted successfully",
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: "Error deleting post",
      };
    }
  }
}
