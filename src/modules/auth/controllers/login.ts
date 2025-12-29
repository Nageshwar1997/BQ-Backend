import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";

import { AppError } from "../../../classes";
import { UserModule } from "../..";
import { generateToken } from "../services";
import {
  githubAuthClient,
  googleAuthClient,
  linkedinAuthClient,
} from "../../../configs";
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
  const url = googleAuthClient.url;
  res.redirect(url);
};

export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.query;

    if (!code) throw new AppError("No code returned from Google", 400);

    // Fetch user info from Google
    const profile = await googleAuthClient.decode(code);
    if (!profile) throw new AppError("User info not found", 400);

    // Prepare payload
    const payload = getOAuthDbPayload(profile, "GOOGLE");

    // Check if user already exists (email = primary identity)
    let user = await UserModule.Models.User.findOne({
      email: payload.email,
    });

    if (user) {
      // If GOOGLE not linked yet, link it
      if (!user.providers.includes("GOOGLE")) {
        user.providers.push("GOOGLE");
        await user.save();
      }
    } else {
      // Create new user
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

    if (!code) throw new AppError("No code returned from LinkedIn", 400);

    const { id_token } = await linkedinAuthClient.token_response(code);

    const data = linkedinAuthClient.decode(id_token);

    const payload = getOAuthDbPayload(data, "LINKEDIN");

    // Find user by email (primary identity)
    let user = await UserModule.Models.User.findOne({
      email: payload.email,
    });

    if (user) {
      // Link provider if not already linked
      if (!user.providers.includes("LINKEDIN")) {
        user.providers.push("LINKEDIN");
        await user.save();
      }
    } else {
      // Create new user
      user = await UserModule.Models.User.create(payload);
    }

    const token = generateToken(user._id);

    res.redirect(authSuccessRedirectUrl(token));
  } catch (err) {
    next(err);
  }
};

export const githubLogin = async (_req: Request, res: Response) => {
  const url = githubAuthClient.url;

  res.redirect(url);
};

export const githubCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.query;

    if (!code) throw new AppError("No code returned from GitHub", 400);

    const { access_token } = await githubAuthClient.token_response(code);

    if (!access_token) {
      throw new AppError("Access token not found", 400);
    }

    const data = await githubAuthClient.decode(access_token);

    const payload = getOAuthDbPayload(data, "GITHUB");

    // Find user by email (primary identity)
    let user = await UserModule.Models.User.findOne({
      email: payload.email,
    });

    if (user) {
      // Link GitHub provider if not already linked
      if (!user.providers.includes("GITHUB")) {
        user.providers.push("GITHUB");
        await user.save();
      }
    } else {
      // Create new user
      user = await UserModule.Models.User.create(payload);
    }

    const token = generateToken(user._id);

    res.redirect(authSuccessRedirectUrl(token));
  } catch (err) {
    next(err);
  }
};
