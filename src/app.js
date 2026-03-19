const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');

const konfigurasi = require('./config');
const logger = { httpLogger: require('./middlewares/logger').httpLogger };
const errorHandler = require('./middlewares/error-handler');
const ruteUtama = require('./routes/index');

const app = express();

// ======================
// Middleware Keamanan
// ======================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: konfigurasi.cors.origin }));
app.use(hpp());

// ======================
// Body Parser
// ======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// HTTP Logger
// ======================
app.use(logger.httpLogger);

// ======================
// Rate Limiting Global
// ======================
app.use(require('./middlewares/rate-limit').rateLimitMiddleware);

// ======================
// Routes API
// ======================
app.use('/api/v1', ruteUtama);

// Serve uploads directory (API generated files)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ======================
// Dashboard (Static Build)
// ======================
const dashboardPath = path.join(__dirname, '..', 'dashboard', 'dist');

// Serve static files dari build React
app.use(express.static(dashboardPath));

// Fallback ke index.html untuk client-side routing
// Gunakan middleware karena Express 5 tidak mendukung wildcard route '*'
app.use((req, res, next) => {
  // Hanya fallback untuk route yang bukan API
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(dashboardPath, 'index.html'), (err) => {
    if (err) {
      // File tidak ditemukan (dashboard belum di-build)
      res.status(404).json({
        berhasil: false,
        pesan: 'Dashboard belum di-build. Jalankan: cd dashboard && npm run build',
      });
    }
  });
});

// ======================
// Error Handler (harus di paling akhir)
// ======================
app.use(errorHandler);

module.exports = app;
