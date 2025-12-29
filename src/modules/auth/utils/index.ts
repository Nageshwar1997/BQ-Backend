import { AppError } from "../../../classes";
import {
  FRONTEND_LOCAL_HOST_CLIENT_URL,
  FRONTEND_PRODUCTION_CLIENT_URL,
  NODE_ENV,
} from "../../../envs";
import { validateZodString } from "../../../utils";
import { TAuthProvider } from "../../user/types";
import { ValidateAuthFieldConfigs } from "../types";

export const validateAuthField = (props: ValidateAuthFieldConfigs) => {
  const { field, nonEmpty = true } = props;
  switch (field) {
    case "firstName":
    case "lastName":
    case "email":
    case "password":
    case "phoneNumber":
    case "confirmPassword": {
      return validateZodString({ ...props, nonEmpty });
    }
    default:
      throw new AppError(
        `Validation for field '${field}' is not implemented.`,
        500
      );
  }
};

export const authSuccessRedirectUrl = (token: string) => {
  return `${
    NODE_ENV === "production"
      ? FRONTEND_PRODUCTION_CLIENT_URL
      : FRONTEND_LOCAL_HOST_CLIENT_URL
  }/oauth-success?token=${token}`;
};

export const getOAuthDbPayload = (
  data: Record<string, string>,
  provider: TAuthProvider
) => {
  const fullName = data.name?.trim() || "";
  const nameParts = fullName.split(/\s+/);

  const firstName = data.given_name || nameParts[0];
  const lastName =
    data.family_name ||
    (nameParts.length > 1 ? nameParts?.slice(1)?.join(" ") : "") ||
    "";
  const profilePic = data.picture || data.avatar_url || "";

  return {
    email: data.email,
    firstName,
    lastName,
    profilePic,
    password: "",
    phoneNumber: "",
    providers: [provider],
    role: "USER",
  };
};
