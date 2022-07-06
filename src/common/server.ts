import { Express, json, urlencoded } from "express";
import cors from "cors";
import router from "../routes";
import whitelistDev from "../config/whitelist-dev.json";
import whitelistProd from "../config/whitelist-prod.json";
import {
  commonErrorHandler,
  sequelizeErrorHandler,
} from "../middlewares/error";

export const initExpress = (app: Express) => {
  app.use(json());
  app.use(urlencoded({ extended: false }));
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "development" ? whitelistDev : whitelistProd,
    })
  );
  app.use("/api", router);
  app.use("/test", (_, res) => {
    return res.status(200).json({
      message: "connected",
    });
  });
  app.use("*", (req, res) => {
    return res.status(404).json({
      errors: [
        {
          method: req.method,
          path: req.path,
        },
      ],
    });
  });
  app.use(sequelizeErrorHandler);
  app.use(commonErrorHandler);
};
