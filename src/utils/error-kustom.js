/**
 * Custom error classes untuk penanganan error yang terstruktur
 */

class AppError extends Error {
  constructor(pesan, statusCode, errors = null) {
    super(pesan);
    this.statusCode = statusCode;
    this.berhasil = false;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super('Validasi gagal', 400, errors);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(pesan = 'Tidak terautentikasi') {
    super(pesan, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(pesan = 'Tidak diizinkan') {
    super(pesan, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(pesan = 'Data tidak ditemukan') {
    super(pesan, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(pesan = 'Data sudah ada') {
    super(pesan, 409);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(pesan = 'Terlalu banyak permintaan, coba lagi nanti') {
    super(pesan, 429);
    this.name = 'RateLimitError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
};
