import { NextFunction, Request, Response } from "express";
import { ClientSession, startSession } from "mongoose";

const tryCatchResponse = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

const tryCatchWithSessionResponse = (
  fn: (
    req: Request,
    res: Response,
    next: NextFunction,
    session: ClientSession,
  ) => Promise<void>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await startSession();
    session.startTransaction();

    try {
      await fn(req, res, next, session);
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      next(err);
    } finally {
      session.endSession();
    }
  };
};

export const tryCatchResponseMiddleware = {
  tryCatch: tryCatchResponse,
  tryCatchWithSession: tryCatchWithSessionResponse,
};
