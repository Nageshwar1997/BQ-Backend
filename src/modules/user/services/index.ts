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
  userId: string | Types.ObjectId | undefined,
  data: Partial<UserProps>
) => {
  if (!userId) throw new AppError("UserId not provided", 400);

  const user = await User.findByIdAndUpdate(userId, data, { new: true });

  if (!user) throw new AppError("User not found to update", 404);

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

export const getUserById = async ({
  id,
  lean = true,
  password = false,
}: {
  id: string | Types.ObjectId;
  lean?: boolean;
  password?: boolean;
}): Promise<UserProps> => {
  let query = User.findById(id);

  if (lean) query = query.lean() as typeof query;
  if (password) query = query.select("-password");

  const user = await query;

  if (!user) throw new AppError("User not found", 404);

  return user;
};
