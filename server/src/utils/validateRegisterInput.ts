import { RegisterInput } from "../types/UserInput";

export const validateRegisterInput = (registerInput: RegisterInput) => {
  if (!registerInput.email.includes("@")) {
    return {
      message: "Invalid email",
      errors: [{ field: "email", message: "Email must contain an @" }],
    };
  }
  if (registerInput.username.length < 6) {
    return {
      message: "Invalid username",
      errors: [
        {
          field: "username",
          message: "Username must be at least 6 characters",
        },
      ],
    };
  }
  if (registerInput.username.length > 20) {
    return {
      message: "Invalid username",
      errors: [
        {
          field: "username",
          message: "Username must be less than 20 characters",
        },
      ],
    };
  }
  if (registerInput.username.includes("@")) {
    return {
      message: "Invalid username",
      errors: [{ field: "username", message: "Username cannot contain an @" }],
    };
  }
  if (registerInput.password.length < 6) {
    return {
      message: "Invalid password",
      errors: [
        {
          field: "password",
          message: "Password must be at least 6 characters",
        },
      ],
    };
  }

  return null;
};
