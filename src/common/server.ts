import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from '../routes';
import whitelistDev from '../config/whitelist-dev.json';
import whitelistProd from '../config/whitelist-prod.json';
import {
  commonErrorHandler,
  sequelizeErrorHandler,
} from '../middlewares/error';
import config from '../config';

export const initExpress = (app: Express) => {
  app.use('/static', express.static('./public'));
  app.use(express.json());
  app.use(cookieParser(config.cookieSecret));
  app.use(express.urlencoded({ extended: false }));
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === 'development' ? whitelistDev : whitelistProd,
    })
  );
  app.use('/api', router);
  app.use('/test', (_, res) => {
    return res.status(200).json({
      message: 'connected',
    });
  });
  app.use('*', (req, res) => {
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
