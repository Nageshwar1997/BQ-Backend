import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import connectDB from "./configs/db.config";
import { CatchErrorResponse, SuccessResponse } from "./utils";
import errorHandler from "./middlewares/errorHandler.middleware";
import notFoundHandler from "./middlewares/notFoundHandler.middleware";
// import mediaRouter from "./routes/mediaFiles.routes";
import { HomeVideo } from "./models";
import { AppError } from "./constructors";

const app = express();
const PORT = process.env.PORT || 5454;

// Middleware to parse JSON
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

// Home route
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  // SuccessResponse(res, 200, "Welcome to the MERN Beautinique API");
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;

    let videos;
    if (page && limit) {
      videos = await HomeVideo.find().skip(skip).limit(limit).lean();
    } else {
      videos = await HomeVideo.find().lean();
    }

    if (!videos) {
      throw new AppError("Videos not found", 404);
    }

    const totalVideos = await HomeVideo.countDocuments();

    SuccessResponse(res, 200, "Videos retrieved successfully", {
      videos,
      totalVideos,
      currentPage: page ? page : 1,
      totalPages: page && limit ? Math.ceil(totalVideos / limit) : 1,
    });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
});

// app.use("/api/media", mediaRouter);

// Catch undefined routes or routes that don't exist
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error: any) {
    console.error(`${error.message} - Server is not running`);
    process.exit(1);
  }
});
