import { Request, Response } from "express";

import { isValidMongoId } from "../../../utils";
import { authModule } from "../../auth";
import { services } from "../../../services";

export const getUserController = async (req: Request, res: Response) => {
  const userId = authModule.services.GetUserIdFromToken(req);
  isValidMongoId(userId, "Invalid userId", 400);

  const user = await services.redis.getCachedUser(userId);

  res.success(200, "User fetched successfully", { user });
};
