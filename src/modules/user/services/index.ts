import { Types } from "mongoose";
import { AppError } from "../../../classes";
import { User } from "../models";
import { UserProps } from "../types";

export const getUserByEmail = async (email: string, lean?: boolean) => {
  let user = null;
  if (lean) {
    user = await User.findOne({ email }).lean();
  } else {
    user = await User.findOne({ email });
  }
  return user;
};

export const updateUser = async (
  data: UserProps,
  userId?: string | Types.ObjectId
) => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true });
  return user;
};

export const getUserByPhoneNumber = async (
  phoneNumber: string,
  lean?: boolean
) => {
  let user = null;
  if (lean) {
    user = await User.findOne({ phoneNumber }).lean();
  } else {
    user = await User.findOne({ phoneNumber });
  }
  return user;
};

export const getUserByEmailOrPhoneNumber = async (
  email: string,
  phoneNumber: string,
  lean?: boolean
) => {
  let user = null;
  if (lean) {
    user = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    }).lean();
  } else {
    user = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
  }

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const getUserById = async (id: string, needPassword?: boolean) => {
  try {
    const query = needPassword
      ? User.findById(id)
      : User.findById(id).select("-password");

    const user = await query.lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user as unknown as UserProps;
  } catch (error) {
    throw error;
  }
};
