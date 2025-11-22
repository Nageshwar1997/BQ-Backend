import "dotenv/config";
import path from "path";
import express from "express";
import QueryString from "qs";
import http from "http";

import router from "./routes";
import { handleNamespace, initSocket } from "./configs";
import {
  ResponseMiddleware,
  CorsMiddleware,
  DatabaseMiddleware,
} from "./middlewares";
import { PORT } from "./envs";

const app = express();
const port = PORT || 5454;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("public")));
app.set("query parser", (str: string) => QueryString.parse(str));

app.use(ResponseMiddleware.success);
app.use(CorsMiddleware.checkOrigin);
app.use(DatabaseMiddleware.checkConnection);

// Home Route
app.get("/", (_, res) =>
  res.success(200, "Welcome to the MERN Beautinique API")
);

// API Routes
app.use("/api", router);

// Error Handling
app.use(ResponseMiddleware.notFound);
app.use(ResponseMiddleware.error);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

handleNamespace("products");
handleNamespace("orders");

// Start server

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export { app, server };
