import { Request, Response } from "express";

import { isValidMongoId } from "../../../utils";
import { Shared } from "../../..";
import { getUserById } from "../services";
import { AuthModule } from "../..";

export const getUserController = async (req: Request, res: Response) => {
  const userId = AuthModule.Services.getUserIdFromToken(req);
  const isValidId = isValidMongoId(userId);

  if (!isValidId) {
    throw new Shared.Classes.AppError("Invalid userId", 400);
  }

  const user = await getUserById(userId);

  res.success(200, "User fetched successfully", { user });
};
