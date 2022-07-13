import { User } from "../entities/User";
import { Mutation, Resolver, Arg, Ctx, Query } from "type-graphql";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { validateRegisterInput } from "../utils/validateRegisterInput";
import { Context } from "../types/Context";
import { COOKIE_NAME } from "../constants";
import {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../types/UserInput";
import { sendEmail } from "../utils/sendmail";
import { TokensModel } from "../models/Tokens";
import { v4 as uuidv4 } from "uuid";

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: Context): Promise<User | undefined | null> {
    if (!req.session.uid) return null;
    const user = await User.findOne(req.session.uid);
    return user;
  }

  @Mutation(() => UserMutationResponse, { nullable: true })
  async register(
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    const validateErrors = validateRegisterInput(registerInput);
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

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("forgotPasswordInput") { email }: ForgotPasswordInput
  ): Promise<boolean> {
    const user = await User.findOne({ email });
    if (!user) return true;

    await TokensModel.findByIdAndDelete({ uid: `${user.id}` });

    const resetToken = uuidv4();

    const hashedToken = await argon2.hash(resetToken);

    await new TokensModel({ uid: `${user.id}`, token: hashedToken }).save();

    await sendEmail(
      user.email,
      `<a href="http://localhost:3000/reset-password?token=${resetToken}&uid=${user.id}">Click here to reset Password</a>`
    );
    return true;
  }

  @Mutation(() => UserMutationResponse)
  async resetPassword(
    @Arg("token") token: string,
    @Arg("uid") uid: string,
    @Arg("resetPasswordInput") { newPassword }: ResetPasswordInput
  ): Promise<UserMutationResponse> {
    if (newPassword.length < 6) {
      return {
        code: 400,
        success: false,
        message: "Password must be at least 6 characters",
        errors: [
          {
            field: "newPassword",
            message: "Password must be at least 6 characters",
          },
        ],
      };
    }
    try {
      const checkToken = await TokensModel.findOne({ uid });
      if (!checkToken)
        return {
          code: 400,
          success: false,
          message: "Invalid token",
          errors: [
            {
              field: "token",
              message: "Invalid token",
            },
          ],
        };
      const valid = await argon2.verify(checkToken.token, token);
      if (!valid)
        return {
          code: 400,
          success: false,
          message: "Invalid token",
          errors: [
            {
              field: "token",
              message: "Invalid token",
            },
          ],
        };
      const userId = parseInt(uid);
      const user = await User.findOne(userId);
      if (!user)
        return {
          code: 400,
          success: false,
          message: "User not found",
          errors: [
            {
              field: "token",
              message: "User not found",
            },
          ],
        };
      const hashedPassword = await argon2.hash(newPassword);
      user.password = hashedPassword;
      await user.save();
      await checkToken.deleteOne();
      return {
        code: 200,
        success: true,
        message: "Password reset successfully",
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
