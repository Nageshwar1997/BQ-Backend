import { generateToken } from "./generateToken.service";
import { getUserIdFromToken } from "./getUserIdFromToken.service";

export const authServices = {
  generateToken,
  getUserIdFromToken,
};
