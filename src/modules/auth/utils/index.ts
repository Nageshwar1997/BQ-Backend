import { randomBytes } from "crypto";
import { AppError } from "../../../classes";
import {
  FRONTEND_LOCAL_HOST_CLIENT_URL,
  FRONTEND_PRODUCTION_CLIENT_URL,
  NODE_ENV,
} from "../../../envs";
import { getImageAsBuffer, validateZodString } from "../../../utils";
import { TAuthProvider } from "../../user/types";
import { ValidateAuthFieldConfigs } from "../types";
import { MediaModule } from "../..";

export const validateAuthField = (props: ValidateAuthFieldConfigs) => {
  const { field, nonEmpty = true } = props;
  switch (field) {
    case "firstName":
    case "otp":
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

const getProfilePic = async (url: string) => {
  if (!url) return "";
  const { buffer, mimetype } = await getImageAsBuffer(url);
  const file = {
    buffer,
    mimetype,
    originalname: "profile-pic.jpg",
  } as Express.Multer.File;
  const cldResp = await MediaModule.Utils.singleImageUploader({
    file,
    cloudinaryConfigOption: "image",
    folder: "Profile_Pictures",
  });

  return cldResp?.secure_url || url;
};

export const getOAuthDbPayload = async (
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

  const profilePic = await getProfilePic(data.picture || data.avatar_url);

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

export const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const generateTokenForRedis = (bytes: number) =>
  randomBytes(bytes).toString("hex");
