import { JwtPayload } from "jsonwebtoken";
import { ValidateZodFieldConfigs } from "../../../types";
import { UserModule } from "../..";

export interface DecodedToken extends JwtPayload {
  userId: string; // Assuming userId is a string
}

export type TLoginFieldsOnly = keyof Pick<
  UserModule.Types.UserProps,
  "email" | "phoneNumber" | "password"
>;
export type TRegisterFieldsOnly =
  | TLoginFieldsOnly
  | keyof Pick<UserModule.Types.UserProps, "firstName" | "lastName">
  | "confirmPassword"
  | "otp";

export interface ValidateAuthFieldConfigs extends ValidateZodFieldConfigs {
  field: TRegisterFieldsOnly;
}
