import cors from "cors";

import { Classes, Constants } from "../..";

export const checkOrigin = cors({
  origin: (origin, callback) => {
    if (!origin || Constants.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Classes.AppError("Not allowed by CORS", 403));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
