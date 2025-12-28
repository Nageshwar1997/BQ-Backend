import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import axios from "axios";

import { AppError } from "../../../classes";
import { UserModule } from "../..";
import { generateToken } from "../services";
import { googleAuthClient, linkedinAuthClient } from "../../../configs/o-auth";
import { GOOGLE_REDIRECT_URI } from "../../../envs";
import { authSuccessRedirectUrl, getOAuthDbPayload } from "../utils";

export const loginController = async (req: Request, res: Response) => {
  const { email, password, phoneNumber } = req.body ?? {};

  const user = await UserModule.Services.getUserByEmailOrPhoneNumber(
    email,
    phoneNumber
  );

  const isPasswordMatch = bcrypt.compareSync(password, user.password);

  if (!isPasswordMatch) {
    throw new AppError("Wrong password", 400);
  }

  const token = generateToken(user._id);

  res.success(200, "User logged in successfully", {
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
    },
  });
};

export const googleLogin = async (_req: Request, res: Response) => {
  const url = googleAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
    redirect_uri: GOOGLE_REDIRECT_URI,
  });
  res.redirect(url);
};

export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const code = req.query?.code as string;

    const { tokens } = await googleAuthClient.getToken(code);

    googleAuthClient.setCredentials(tokens);

    // Fetch user info
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    if (!data) {
      throw new AppError("User info not found", 400);
    }

    let user = await UserModule.Services.getUserByEmail(data.email);

    const payload = getOAuthDbPayload(data, "GOOGLE");

    if (!user) {
      user = await UserModule.Models.User.create(payload);
    }

    const token = generateToken(user._id);

    res.redirect(authSuccessRedirectUrl(token));
  } catch (err) {
    next(err);
  }
};

export const linkedinLogin = async (_req: Request, res: Response) => {
  const url = linkedinAuthClient.url;

  res.redirect(url);
};

export const linkedinCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error("No code returned from LinkedIn");

    const { id_token } = await linkedinAuthClient.token_response(code);

    const data = linkedinAuthClient.decode(id_token);

    const payload = getOAuthDbPayload(data, "LINKEDIN");

    let user = await UserModule.Services.getUserByEmail(payload.email);

    if (!user) {
      user = await UserModule.Models.User.create(payload);
    }

    const token = generateToken(user._id);

    res.redirect(authSuccessRedirectUrl(token));
  } catch (err) {
    next(err);
  }
};
