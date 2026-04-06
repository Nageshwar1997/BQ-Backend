import "dotenv/config";
import path from "path";
import express, { Request, Response } from "express";
import { parse } from "qs";
import http from "http";

import router from "./routes";
import { Configs } from "./Configs";
import { Middlewares } from "./Middlewares";
import { PORT } from "./Envs";
import { mailService, redisService } from "./Classes";

const app = express();

// ----------------- MIDDLEWARES ORDER -----------------

// 1. Assign requestId first (for tracing logs)
app.use(Middlewares.Request.Id);

// 2. Body parsers & static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("public")));
app.set("query parser", (str: string) => parse(str));

// 3. Logger (logs all requests)
app.use(Middlewares.Logger.Request);

// 4. Custom middlewares
app.use(Middlewares.Response.Success);
app.use(Middlewares.Cors);
app.use(Middlewares.Database);

// ----------------- ROUTES -----------------
// Home Route
app.get("/", (_: Request, res: Response) =>
  res.success(200, "Welcome to the MERN Beautinique API"),
);

// API Routes
app.use("/api", router);

// ----------------- ERROR HANDLING -----------------
app.use(Middlewares.Response.NotFound);
app.use(Middlewares.Logger.Error);
app.use(Middlewares.Response.Error);

// ----------------- SERVER SETUP -----------------
const server = http.createServer(app);

// Initialize Socket.IO
Configs.Socket.Init(server);

Configs.Socket.Namespace("products");
Configs.Socket.Namespace("orders");

(async () => {
  try {
    await Configs.ConnectDB();
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
