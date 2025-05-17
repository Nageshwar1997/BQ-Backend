import "dotenv/config";
import path from "path";
import express, { Request, Response } from "express";
import { Common } from "./src";

// import router from "./src/router";
// import {
//   ResponseMiddleware,
//   CorsMiddleware,
//   DatabaseMiddleware,
// } from "./src/middlewares";

const app = express();
const port = Common.Envs.PORT || 5454;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.resolve("public")));

// Custom Middlewares
// app.use(ResponseMiddleware.success);
// app.use(CorsMiddleware.checkOrigin);
// app.use(DatabaseMiddleware.checkConnection);

// Home Route
app.get("/", (_: Request, res: Response) => {
  // res.success(200, "Welcome to the MERN Beautinique API");
});

// Routes
// app.use("/api", router);

// // Error Handling Routes
// app.use(ResponseMiddleware.notFound);
// app.use(ResponseMiddleware.error);

if (Common.Envs.NODE_ENV === "development") {
  app.listen(port, async () => {
    try {
      await Common.Configs.Database.connect();
      console.log(`Server running on http://localhost:${8080}`);
    } catch (error) {
      console.error("Server startup failed:", error);
      process.exit(1);
    }
  });
}

export default app;
