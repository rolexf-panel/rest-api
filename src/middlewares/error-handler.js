const konfigurasi = require('../config');
const { responsGagal } = require('../utils/respons');
const logger = require('./logger');
const { AppError } = require('../utils/error-kustom');

/**
 * Middleware penanganan error terpusat
 * Semua error ditangani di sini untuk konsistensi respons
 */

const errorHandler = (err, req, res, _next) => {
  const error = { ...err };
  error.message = err.message;

  // Log error dengan konteks
  logger.error('Error terjadi:', {
    pesan: err.message,
    stack: err.stack,
    url: req.originalUrl,
    metode: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Error dari AppError (operasional)
  if (err instanceof AppError) {
    return responsGagal(res, {
      pesan: err.message,
      errors: err.errors,
      statusCode: err.statusCode,
    });
  }

  // Prisma: Unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return responsGagal(res, {
      pesan: 'Data sudah ada',
      errors: [{ field, pesan: `${field} sudah digunakan` }],
      statusCode: 409,
    });
  }

  // Prisma: Record not found
  if (err.code === 'P2025') {
    return responsGagal(res, {
      pesan: 'Data tidak ditemukan',
      statusCode: 404,
    });
  }

  // JWT: Token tidak valid
  if (err.name === 'JsonWebTokenError') {
    return responsGagal(res, {
      pesan: 'Token tidak valid',
      statusCode: 401,
    });
  }

  // JWT: Token kedaluwarsa
  if (err.name === 'TokenExpiredError') {
    return responsGagal(res, {
      pesan: 'Token sudah kedaluwarsa',
      statusCode: 401,
    });
  }

  // Syntax error pada JSON body
  if (err.type === 'entity.parse.failed') {
    return responsGagal(res, {
      pesan: 'Format JSON tidak valid',
      statusCode: 400,
    });
  }

  // Error yang tidak terduga — jangan bocorkan detail di production
  const pesanError =
    konfigurasi.env === 'production'
      ? 'Terjadi kesalahan pada server'
      : err.message || 'Terjadi kesalahan pada server';

  return responsGagal(res, {
    pesan: pesanError,
    statusCode: 500,
  });
};

module.exports = errorHandler;
