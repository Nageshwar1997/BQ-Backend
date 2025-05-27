import { JwtPayload } from "jsonwebtoken";
import { ValidateZodFieldConfigs } from "../../../types";

export interface DecodedToken extends JwtPayload {
  userId: string; // Assuming userId is a string
}

export type TLoginFieldsOnly = "email" | "phoneNumber" | "password";
export type TRegisterFieldsOnly =
  | TLoginFieldsOnly
  | "firstName"
  | "lastName"
  | "confirmPassword";

export interface ValidateAuthFieldConfigs extends ValidateZodFieldConfigs {
  field: TRegisterFieldsOnly;
}
