import "dotenv/config";
import path from "path";
import express, { Request, Response } from "express";
import { parse } from "qs";
import http from "http";

import router from "./routes";
import { connectDB, handleNamespace, initSocket } from "./configs";
import {
  ResponseMiddleware,
  CorsMiddleware,
  DatabaseMiddleware,
  RequestMiddleware,
  LoggerMiddleware,
} from "./middlewares";
import { PORT } from "./envs";
import { mailService, redisService } from "./classes";

const app = express();

// ----------------- MIDDLEWARES ORDER -----------------

// 1. Assign requestId first (for tracing logs)
app.use(RequestMiddleware.requestId);

// 2. Body parsers & static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("public")));
app.set("query parser", (str: string) => parse(str));

// 3. Logger (logs all requests)
app.use(LoggerMiddleware.expressLogger);

// 4. Custom middlewares
app.use(ResponseMiddleware.success);
app.use(CorsMiddleware.checkOrigin);
app.use(DatabaseMiddleware.checkDbConnection);

// ----------------- ROUTES -----------------
// Home Route
app.get("/", (_: Request, res: Response) =>
  res.success(200, "Welcome to the MERN Beautinique API")
);

// API Routes
app.use("/api", router);

// ----------------- ERROR HANDLING -----------------
app.use(ResponseMiddleware.notFound);
app.use(LoggerMiddleware.expressErrorLogger);
app.use(ResponseMiddleware.error);

// ----------------- SERVER SETUP -----------------
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

handleNamespace("products");
handleNamespace("orders");

(async () => {
  try {
    await connectDB();
    await Promise.all([redisService.connect(), mailService.checkConnection()]);

    server.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();

export { app, server };
