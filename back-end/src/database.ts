import { Sequelize } from "sequelize";
const databaseConfig = require("./config/database");

type Environment = "development";
const environment = (process.env.NODE_ENV || "development") as Environment;

const config = databaseConfig[environment];

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: console.log,
  }
);
