import { FieldError } from "../generated/graphql";

export const mapFieldError = (errors: FieldError[]) =>
  errors.reduce((acc, error) => ({ ...acc, [error.field]: error.message }), {});
