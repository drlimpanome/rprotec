const dotenv = require("dotenv");

dotenv.config();

const databaseConfig = {
  development: {
    username: process.env.DB_USER || "user",
    password: process.env.DB_PASS || "password",
    database: process.env.DB_NAME || "impactus_db",
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
  },
};

module.exports = databaseConfig; // Use CommonJS syntax here
