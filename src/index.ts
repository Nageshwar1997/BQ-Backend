import express, { Request, Response } from "express";
import testRouter from "./routes/test";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API routes
app.use("/test", testRouter);
// Root route
app.get("/", (_: Request, res: Response) => {
  res.send("Express + TypeScript Server is running!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
