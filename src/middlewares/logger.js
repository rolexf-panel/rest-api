const morgan = require('morgan');
const winston = require('winston');
const konfigurasi = require('../config');

// Konfigurasi Winston logger
const winstonLogger = winston.createLogger({
  level: konfigurasi.env === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    konfigurasi.env === 'production'
      ? winston.format.json()
      : winston.format.combine(winston.format.colorize(), winston.format.simple()),
  ),
  transports: [
    new winston.transports.Console(),
    // TODO: Tambahkan file transport untuk production
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Morgan middleware untuk HTTP request logging
const httpLogger = konfigurasi.env === 'production' ? morgan('combined') : morgan('dev');

module.exports = winstonLogger;
module.exports.httpLogger = httpLogger;
