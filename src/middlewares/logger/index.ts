import winston from "winston";
import expressWinston from "express-winston";
import { AppError } from "../../classes";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// ===== Winston Logger =====
const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),

  transports: [
    // Console - all logs
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),

    // ERROR logs only (4xx + 5xx)
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(
        winston.format((info) => {
          return info.level === "error" ? info : false;
        })(),
        timestamp(),
        logFormat
      ),
    }),

    // SUCCESS / INFO logs only (2xx)
    new winston.transports.File({
      filename: "logs/combined.log",
      level: "info",
      format: combine(
        winston.format((info) => {
          return info.level === "info" ? info : false;
        })(),
        timestamp(),
        logFormat
      ),
    }),
  ],
});

// ===== Request Logger =====
export const expressLogger = expressWinston.logger({
  winstonInstance: logger,
  msg: "[{{req.requestId}}] {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
  expressFormat: false,
  colorize: false,
  meta: false,
  requestWhitelist: [...expressWinston.requestWhitelist, "requestId"],
  ignoreRoute: (req) => req.method === "OPTIONS",
});

// ===== Error Logger =====
export const expressErrorLogger = expressWinston.errorLogger({
  winstonInstance: logger,
  msg: "[{{req.requestId}}] {{req.method}} {{req.url}} {{res.statusCode}} {{err.message}}",
  meta: true,
  requestWhitelist: [...expressWinston.requestWhitelist, "requestId"],

  // Log level: 5xx → error, 4xx → warn (optional)
  level: (_req, _res, err) => {
    const e = err as AppError;
    return e.statusCode && e.statusCode >= 500 ? "error" : "warn";
  },

  // Skip non-error responses (<=400)
  skip: (_req, _res, err) => {
    const e = err as AppError;
    return !e.statusCode || e.statusCode < 400;
  },
});
