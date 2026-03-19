const { RateLimiterMemory } = require('rate-limiter-flexible');
const konfigurasi = require('./index');

// Konfigurasi rate limiter untuk tier berbeda
const buatRateLimiter = (points, duration) => {
  return new RateLimiterMemory({
    points,
    duration: duration * 60, // konversi menit ke detik
    blockDuration: duration * 60, // blokir selama durasi yang sama
  });
};

// Rate limiter untuk pengguna free
const rateLimiterFree = buatRateLimiter(konfigurasi.rateLimit.free, konfigurasi.rateLimit.window);

// Rate limiter untuk pengguna paid
const rateLimiterPaid = buatRateLimiter(konfigurasi.rateLimit.paid, konfigurasi.rateLimit.window);

// Rate limiter untuk endpoint autentikasi (anti brute-force)
const rateLimiterAuth = buatRateLimiter(
  konfigurasi.rateLimit.authLimit,
  15, // 15 menit
);

module.exports = {
  rateLimiterFree,
  rateLimiterPaid,
  rateLimiterAuth,
};
