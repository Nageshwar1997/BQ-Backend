import "dotenv/config";
import path from "path";
import express, { Request, Response } from "express";
import { parse } from "qs";
import http from "http";

import router from "./routes";
import { configs } from "./configs";
import { middlewares } from "./middlewares";
import { PORT } from "./envs";
import { services } from "./services";

const app = express();

// ----------------- MIDDLEWARES ORDER -----------------

// 1. Assign requestId first (for tracing logs)
app.use(middlewares.request.id);

// 2. Body parsers & static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("public")));
app.set("query parser", (str: string) => parse(str));

// 3. Logger (logs all requests)
app.use(middlewares.logger.request);

// 4. Custom middlewares
app.use(middlewares.response.success);
app.use(middlewares.cors);
app.use(middlewares.database);

// ----------------- ROUTES -----------------
// Home Route
app.get("/", (_: Request, res: Response) =>
  res.success(200, "Welcome to the MERN Beautinique API"),
);

// API Routes
app.use("/api", router);

// ----------------- ERROR HANDLING -----------------
app.use(middlewares.response.notFound);
app.use(middlewares.logger.error);
app.use(middlewares.response.error);

// ----------------- SERVER SETUP -----------------
const server = http.createServer(app);

// Initialize Socket.IO
configs.socket.init(server);

configs.socket.namespace("products");
configs.socket.namespace("orders");

(async () => {
  try {
    await configs.connectDB();
    await Promise.all([
      services.redis.connect(),
      services.mail.checkConnection(),
    ]);

    server.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();

export { app, server };
