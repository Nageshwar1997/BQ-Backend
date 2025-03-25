import { Request, Response, Router } from "express";

const testRouter = Router();

testRouter.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from TypeScript!" });
});

export default testRouter;
