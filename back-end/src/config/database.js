const dotenv = require("dotenv");

dotenv.config();

const databaseConfig = {
  development: {
    username: process.env.DATABASE_USER || process.env.DB_USER || "user",
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASS || "password",
    database: process.env.DATABASE_NAME || process.env.DB_NAME || "impactus_db",
    host: process.env.DATABASE_HOST || process.env.DB_HOST || "localhost",
    port: process.env.DATABASE_PORT || process.env.DB_PORT || 3306,
    dialect: "mysql",
  },
  production: {
    username: process.env.DATABASE_USER || process.env.DB_USER || "user",
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASS || "password",
    database: process.env.DATABASE_NAME || process.env.DB_NAME || "impactus_db",
    host: process.env.DATABASE_HOST || process.env.DB_HOST || "localhost",
    port: process.env.DATABASE_PORT || process.env.DB_PORT || 3306,
    dialect: "mysql",
  },
};

module.exports = databaseConfig; // Use CommonJS syntax here
