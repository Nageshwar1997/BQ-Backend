import { generateToken } from "./generateToken";
import { getUserIdFromToken } from "./getUserIdFromToken";

export * from "./getUserIdFromToken";

export const authServices = {
  generateToken,
  getUserIdFromToken,
};
