import { Router } from "express";

import { getUserController } from "../controllers";
import { ResponseMiddleware } from "../../../middlewares";

export const userRouter = Router();

userRouter.get("/user", ResponseMiddleware.catchAsync(getUserController));
