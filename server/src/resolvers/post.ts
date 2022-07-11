import {
  Mutation,
  Resolver,
  Arg,
  Query,
  ID,
  UseMiddleware,
} from "type-graphql";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { CreatePostInput, UpdatePostInput } from "../types/PostInput";
import { Post } from "../entities/Post";
import { checkAuth } from "../middleware/checkAuth";

@Resolver()
export class PostResolver {
  @UseMiddleware(checkAuth)
  @Mutation(() => PostMutationResponse)
  async createPost(
    @Arg("createPostInput") { title, text }: CreatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const post = Post.create({
        title,
        text,
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

  @Query(() => [Post], { nullable: true })
  async posts(): Promise<Post[]> {
    try {
      return Post.find();
    } catch (error) {
      return [];
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
    @Arg("updatePostInput") { id, title, text }: UpdatePostInput
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
    @Arg("id", () => ID) id: number
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
