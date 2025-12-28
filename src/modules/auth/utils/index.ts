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
  const payload = {
    email: data.email,
    firstName: data.given_name || data.name?.split(" ")[0] || "",
    lastName: data.family_name || data.name?.split(" ")[1] || "",
    profilePic: data.picture || "",
    password: "",
    phoneNumber: "",
    provider,
    role: "USER",
  };

  return payload;
};
