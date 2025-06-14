const { Sequelize } = require('sequelize');
const config = require('./config/config.js');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false, // Set to true to see SQL queries in console
  }
);

module.exports = sequelize; 