import { Sequelize } from "sequelize";
const databaseConfig = require("./config/database");

type Environment = "development" | "production";
const environment = (process.env.NODE_ENV || "development") as Environment;

const config = databaseConfig[environment];

if (!config) {
  throw new Error(`Database configuration not found for environment: ${environment}`);
}

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
