import cors from "cors";
import { allowedOrigins } from "../../constants";
import { AppError } from "../../classes";

export const checkOrigin = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError({ message: "Not allowed by CORS", statusCode: 403, code: "AUTH_ERROR" }));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
