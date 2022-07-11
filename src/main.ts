import express from 'express';
import Database from './common/database';
import logger from './common/logger';
import { initExpress } from './common/server';
import syncTable from './models';

const app = express();

initExpress(app);

Database.authenticate()
  .then(() => {
    syncTable();
    Database.sync({ alter: true })
      .then(() => {
        app.listen(process.env.PORT, () => {
          console.log('server is on: ', process.env.PORT);
        });
      })
      .catch(logger.debug);
  })
  .catch(logger.debug);
