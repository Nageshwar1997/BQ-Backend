import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { CatchErrorResponse, SuccessResponse } from "./utils";
import connectDB from "./configs/db.config";
import { AppError } from "./constructors";
import router from "./routes";
import errorHandler from "./middlewares/errorHandler.middleware";
import notFoundHandler from "./middlewares/notFoundHandler.middleware";

const app = express();
const PORT = process.env.PORT || 5454;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  process.env.FRONTEND_LOCAL_HOST_CLIENT_URL,
  process.env.FRONTEND_LOCAL_HOST_ADMIN_URL,
  process.env.FRONTEND_LOCAL_HOST_MASTER_URL,
  process.env.FRONTEND_LOCAL_HOST_PUBLIC_URL_1,
  process.env.FRONTEND_LOCAL_HOST_PUBLIC_URL_2,
  process.env.FRONTEND_PRODUCTION_CLIENT_URL,
  process.env.FRONTEND_PRODUCTION_ADMIN_URL,
  process.env.FRONTEND_PRODUCTION_MASTER_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins?.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Database Connection Middleware
app.use(async (_: Request, __: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
});

// Home route
app.get("/", (_: Request, res: Response) => {
  SuccessResponse(res, 200, "Welcome to the MERN Beautinique API");
});

// All api routes
app.use("/api", router);

// Catch undefined routes or routes that don't exist
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

if (process.env.NODE_ENV === "development") {
  app.listen(PORT, async () => {
    try {
      await connectDB();
      console.log(`Server running on http://localhost:${PORT}`);
    } catch (error) {
      console.error("Server startup failed:", error);
      process.exit(1);
    }
  });
}

export default app;
