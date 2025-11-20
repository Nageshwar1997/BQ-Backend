import http from "http";
import express from "express";
import path from "path";
import QueryString from "qs";
import "dotenv/config";

import router from "./routes";
import { connectDB } from "./configs";
import {
  ResponseMiddleware,
  CorsMiddleware,
  DatabaseMiddleware,
} from "./middlewares";
import { NODE_ENV, PORT } from "./envs";
import { getNamespace, initSocket } from "./configs/socket";
import { ChatbotModule } from "./modules";

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

// Routes
app.use("/api", router);

// Error Handling Routes
app.use(ResponseMiddleware.notFound);
app.use(ResponseMiddleware.error);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Create products namespace
const productsNsp = getNamespace("products");
const ordersNsp = getNamespace("products");

// Initialize product-specific socket logic
ChatbotModule.Sockets.initProductSocket(productsNsp);
ChatbotModule.Sockets.initProductSocket(ordersNsp);

// Start server
if (NODE_ENV === "development") {
  server.listen(port, async () => {
    try {
      await connectDB();
      console.log(`Server running on http://localhost:${port}`);
    } catch (error) {
      console.error("Server startup failed:", error);
      process.exit(1);
    }
  });
}

export { app, server };
