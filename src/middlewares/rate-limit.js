const { RateLimitError } = require('../utils/error-kustom');
const { rateLimiterFree, rateLimiterPaid, rateLimiterAuth } = require('../config/rate-limiter');

/**
 * Middleware rate limiting
 * Menggunakan tier pengguna untuk menentukan batas request
 */
const rateLimitMiddleware = async (req, res, next) => {
  try {
    // Tentukan rate limiter berdasarkan tier pengguna
    let limiter = rateLimiterFree;

    if (req.user) {
      limiter = req.user.tier === 'paid' ? rateLimiterPaid : rateLimiterFree;
    }

    // Gunakan IP atau user ID sebagai key
    const key = req.user ? req.user.id : req.ip;

    const hasil = await limiter.consume(key);

    // Tambahkan header rate limit ke response
    res.set({
      'X-RateLimit-Limit': limiter.points,
      'X-RateLimit-Remaining': hasil.remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + hasil.msBeforeNext).toISOString(),
    });

    next();
  } catch (error) {
    if (error.remainingPoints !== undefined) {
      res.set({
        'X-RateLimit-Limit': error.totalPoints,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(Date.now() + error.msBeforeNext).toISOString(),
        'Retry-After': Math.ceil(error.msBeforeNext / 1000),
      });
      return next(new RateLimitError());
    }
    next(error);
  }
};

/**
 * Rate limit khusus untuk endpoint autentikasi
 * Lebih ketat untuk mencegah brute-force
 */
const rateLimitAuth = async (req, res, next) => {
  try {
    const key = req.ip;
    const hasil = await rateLimiterAuth.consume(key);

    res.set({
      'X-RateLimit-Limit': rateLimiterAuth.points,
      'X-RateLimit-Remaining': hasil.remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + hasil.msBeforeNext).toISOString(),
    });

    next();
  } catch (error) {
    if (error.remainingPoints !== undefined) {
      res.set({
        'X-RateLimit-Limit': error.totalPoints,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(Date.now() + error.msBeforeNext).toISOString(),
        'Retry-After': Math.ceil(error.msBeforeNext / 1000),
      });
      return next(new RateLimitError('Terlalu banyak percobaan login, coba lagi nanti'));
    }
    next(error);
  }
};

module.exports = { rateLimitMiddleware, rateLimitAuth };
