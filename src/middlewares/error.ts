import { ErrorRequestHandler } from "express";
import { ValidationError } from "sequelize";
import config from "../config";

export const sequelizeErrorHandler: ErrorRequestHandler = (
  err,
  _,
  res,
  next
) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      errors: config.isProd
        ? err.errors.map((ele) => ({
            message: ele.message,
          }))
        : err.errors.map((ele) => ({
            message: ele.message,
            key: ele.validatorKey,
            type: ele.type,
            value: ele.value,
            path: ele.path,
          })),
    });
  }
  next(err);
};

export const authErrorHandler: ErrorRequestHandler = (err, _, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      errors: [
        {
          auth: err.message,
        },
      ],
    });
  }
  next(err);
};

export const commonErrorHandler: ErrorRequestHandler = (err, _, res, next) => {
  return res.status(500).json({
    errors: [
      {
        unknown: err.message,
      },
    ],
  });
};
