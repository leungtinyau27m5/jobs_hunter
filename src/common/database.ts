import { Sequelize } from "sequelize";
import config from "../config";

const Database = new Sequelize(config.dbSchema, config.dbUser, config.dbPassword, {
  host: config.dbHost,
  port: +config.dbPort,
  dialect: "mysql"
})

export default Database