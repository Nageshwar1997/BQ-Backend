import cors from "cors";
import { allowedOrigins } from "../../constants";
import { Shared } from "../..";

export const checkOrigin = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Shared.Classes.AppError("Not allowed by CORS", 403));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
