import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./configs/db.config";
import { SuccessResponse } from "./utils";
import errorHandler from "./middlewares/errorHandler.middleware";
import notFoundHandler from "./middlewares/notFoundHandler.middleware";
import mediaRouter from "./routes/mediaFiles.routes";

const app = express();
const PORT = process.env.PORT || 5454;

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// const allowedOrigins = [
//   process.env.FRONTEND_LOCAL_HOST_CLIENT_URL,
//   process.env.FRONTEND_LOCAL_HOST_ADMIN_URL,
//   process.env.FRONTEND_LOCAL_HOST_MASTER_URL,
//   process.env.FRONTEND_LOCAL_HOST_PUBLIC_URL_1,
//   process.env.FRONTEND_LOCAL_HOST_PUBLIC_URL_2,
//   process.env.FRONTEND_PRODUCTION_CLIENT_URL,
//   process.env.FRONTEND_PRODUCTION_ADMIN_URL,
//   process.env.FRONTEND_PRODUCTION_MASTER_URL,
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins?.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: "*",
  })
);

// Home route
app.get("/", mediaRouter);

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
