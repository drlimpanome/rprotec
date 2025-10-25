// src/config/database.d.ts
declare module "./database" {
  import { Dialect } from "sequelize";

  interface DatabaseConfig {
    username: string;
    password: string;
    database: string;
    host: string;
    dialect: Dialect;
  }

  interface Config {
    development: DatabaseConfig;
    // Add other environments if needed, e.g., production or test
  }

  const config: Config;
  export = config;
}
