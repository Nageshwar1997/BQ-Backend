import { Request, Response } from "express";

import { isValidMongoId } from "../../../utils";
import { redisService } from "../../../Classes";
import { Modules } from "../..";

export const getUserController = async (req: Request, res: Response) => {
  const userId = Modules.Auth.Services.getUserIdFromToken(req);
  isValidMongoId(userId, "Invalid userId", 400);

  const user = await redisService.getCachedUser(userId);

  res.success(200, "User fetched successfully", { user });
};
