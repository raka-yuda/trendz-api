require('dotenv').config();

module.exports = {
  HOST: process.env.DB_HOSTNAME,
  USER: process.env.DB_USERNAME,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    useUTC: false, // for reading from database
  },
  timezone: '+07:00', // for writing to database
};
