import { User } from "../entities/User";
import { Mutation, Resolver, Arg, Ctx } from "type-graphql";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { RegisterInput } from "../types/RegisterInput";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { LoginInput } from "../types/LoginInput";
import { Context } from "../types/Context";
import { COOKIE_NAME } from "../constants";

@Resolver()
export class UserResolver {
  @Mutation(() => UserMutationResponse, { nullable: true })
  async register(
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    const validateErrors = await validateRegisterInput(registerInput);
    if (validateErrors != null) {
      return {
        code: 400,
        success: false,
        ...validateErrors,
      };
    }
    try {
      const { username, email, password } = registerInput;
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
              message:
                existingUser.username === username ? "Username" : "Email",
            },
          ],
        };
      }

      const hashedPassword = await argon2.hash(password);

      const user = User.create({
        username,
        email,
        password: hashedPassword,
      });
      await user.save();

      req.session.uid = user.id;
      return {
        code: 200,
        success: true,
        message: "Registered successfully",
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

  @Mutation(() => UserMutationResponse)
  async login(
    @Arg("loginInput") loginInput: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const { usernameOrEmail, password } = loginInput;
      const user = await User.findOne(
        usernameOrEmail.includes("@")
          ? { where: { email: usernameOrEmail } }
          : { where: { username: usernameOrEmail } }
      );
      if (!user) {
        return {
          code: 400,
          success: false,
          message: "User not found",
          errors: [
            {
              field: "usernameOrEmail",
              message: "Username or email not found",
            },
          ],
        };
      }

      const valid = await argon2.verify(user.password, password);
      if (!valid) {
        return {
          code: 400,
          success: false,
          message: "Invalid password",
          errors: [
            {
              field: "password",
              message: "Invalid password",
            },
          ],
        };
      }

      req.session.uid = user.id;
      console.log(req.session);

      return {
        code: 200,
        success: true,
        message: "Logged in successfully",
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

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: Context): Promise<Boolean> {
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((error) => {
        if (error) {
          console.log(error);
          resolve(false);
        }
        resolve(true);
      });
    });
  }
}
