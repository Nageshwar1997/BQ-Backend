import "dotenv/config";
import path from "path";
import express, { Request, Response } from "express";
import { Common } from "./src";
import { Middlewares } from "./src/common";

// import router from "./src/router";

const app = express();
const port = Common.Envs.PORT || 5454;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.resolve("public")));

// Custom Middlewares
app.use(Middlewares.Response.success);
app.use(Middlewares.Cors.checkOrigin);
app.use(Middlewares.Database.checkConnection);

// Home Route
app.get("/", (_: Request, res: Response) => {
  res.success(200, "Welcome to the MERN Beautinique API");
});

// Routes
// app.use("/api", router);

// Error Handling Routes
app.use(Middlewares.Response.notFound);
app.use(Middlewares.Response.error);

if (Common.Envs.NODE_ENV === "development") {
  app.listen(port, async () => {
    try {
      await Common.Configs.Database.connect();
      console.log(`Server running on http://localhost:${port}`);
    } catch (error) {
      console.error("Server startup failed:", error);
      process.exit(1);
    }
  });
}

export default app;
