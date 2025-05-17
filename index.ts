import "dotenv/config";
import path from "path";
import express, { Request, Response } from "express";
import { Shared } from "./src";

// import router from "./src/router";
// import { connectDB } from "./src/configs";
// import {
//   ResponseMiddleware,
//   CorsMiddleware,
//   DatabaseMiddleware,
// } from "./src/middlewares";

const app = express();
const port = Shared.Envs.PORT || 5454;

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

if (Shared.Envs.NODE_ENV === "development") {
  app.listen(port, async () => {
    try {
      // await connectDB();
      console.log(`Server running on http://localhost:${8080}`);
    } catch (error) {
      console.error("Server startup failed:", error);
      process.exit(1);
    }
  });
}

export default app;
