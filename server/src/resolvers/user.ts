import { User } from "../entities/User";
import { Mutation, Resolver, Arg } from "type-graphql";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";

@Resolver()
export class UserResolver {
  @Mutation(() => UserMutationResponse, { nullable: true })
  async register(
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<UserMutationResponse> {
    try {
      const existingUser = await User.findOne({
        where: [{ email }, { username }],
      });
      if (existingUser) {
        return {
          code: 400,
          success: false,
          message: "User already exists",
          errors: [
            {
              field: existingUser.username === username ? "username" : "email",
              message: "User already exists",
            },
          ],
        };
      }

      const hashedPassword = await argon2.hash(password);

      const user = User.create({ username, email, password: hashedPassword });
      await user.save();
      return {
        code: 200,
        success: true,
        message: "User registered successfully",
        user,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }
}
