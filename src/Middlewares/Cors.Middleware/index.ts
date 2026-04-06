import cors from "cors";
import { Constants } from "../../Constants";
import { AppError } from "../../Classes";

export const Cors = cors({
  origin: (origin, callback) => {
    if (!origin || Constants.Common.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(
        new AppError({
          message: "Not allowed by CORS",
          statusCode: 403,
          code: "AUTH_ERROR",
        }),
      );
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
