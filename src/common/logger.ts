import { existsSync, mkdirSync } from "fs";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "../config";

if (!existsSync(config.logDir)) {
  mkdirSync(config.logDir);
}

const level = config.isProd ? "warn" : "debug";

const logger = createLogger({
  level,
  transports: [
    new transports.Console({
      level: level,
      format: format.combine(
        format.errors({ stack: true }),
        format.prettyPrint()
      ),
    }),
    new DailyRotateFile({
      dirname: config.logDir,
      filename: "%DATE%.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
      // colorize: true,
      // prettyPrint: true,
    }),
  ],
  exitOnError: false,
});

export default logger;
