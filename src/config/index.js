require('dotenv').config();

const konfigurasi = {
  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.APP_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'rahasia-default-ganti-ini',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'rahasia-refresh-default',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Rate Limiting
  rateLimit: {
    free: parseInt(process.env.RATE_LIMIT_FREE, 10) || 100,
    paid: parseInt(process.env.RATE_LIMIT_PAID, 10) || 1000,
    window: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15, // menit
    authLimit: process.env.NODE_ENV === 'production' ? 5 : 50, // batas untuk endpoint autentikasi
  },

  // Upload
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB default
    dir: process.env.UPLOAD_DIR || './uploads',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  // API Eksternal
  external: {
    openWeatherMap: process.env.OPENWEATHERMAP_API_KEY,
    currency: process.env.CURRENCY_API_KEY,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || 'restapi_verfication_bot',
  },
};

// Validasi variabel wajib
if (!konfigurasi.databaseUrl && konfigurasi.env === 'production') {
  console.error('❌ DATABASE_URL wajib diatur di lingkungan produksi');
  process.exit(1);
}

if (konfigurasi.jwt.secret === 'rahasia-default-ganti-ini' && konfigurasi.env === 'production') {
  console.error('❌ JWT_SECRET harus diganti di lingkungan produksi');
  process.exit(1);
}

module.exports = konfigurasi;
