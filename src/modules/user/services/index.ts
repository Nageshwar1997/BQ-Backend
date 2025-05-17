import { AppError } from "../../../classes";
import { User } from "../models";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({ email }).lean();
    return user;
  } catch (error) {
    throw error;
  }
};

export const getUserByPhoneNumber = async (phoneNumber: string) => {
  try {
    const user = await User.findOne({ phoneNumber }).lean();
    return user;
  } catch (error) {
    throw error;
  }
};

export const getUserByEmailOrPhoneNumber = async (
  email: string,
  phoneNumber: string
) => {
  try {
    const user = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    }).lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  } catch (error) {
    throw error;
  }
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
    return user;
  } catch (error) {
    throw error;
  }
};
