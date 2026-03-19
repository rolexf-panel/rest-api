require('dotenv').config();

const app = require('./app');
const konfigurasi = require('./config');
const prisma = require('./config/prisma');
const logger = require('./middlewares/logger');
const { inisialisasiBot, matikanBot } = require('./modules/bot-telegram/bot-telegram.service');
const { mulaiCleanupScheduler } = require('./utils/cleanup');

const PORT = konfigurasi.port;

// Fungsi untuk memulai server
const mulaiServer = async () => {
  try {
    // Verifikasi koneksi database (opsional - server tetap berjalan walau DB gagal)
    try {
      await prisma.$connect();
      logger.info('✅ Database terhubung');
    } catch (_dbError) {
      logger.warn('⚠️ Database tidak terhubung, server berjalan tanpa database');
      logger.warn('Pastikan DATABASE_URL dikonfigurasi dengan benar');
    }

    // Mulai cleanup scheduler untuk file uploads
    mulaiCleanupScheduler();

    // Inisialisasi Bot Telegram
    const botTelegram = inisialisasiBot();
    if (botTelegram) {
      logger.info('🤖 Bot Telegram aktif');
    }

    // Mulai server HTTP
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server berjalan di port ${PORT}`);
      logger.info(`📍 Environment: ${konfigurasi.env}`);
      logger.info(`🔗 URL: ${konfigurasi.appUrl}`);
      logger.info(`📖 Health check: ${konfigurasi.appUrl}/api/v1/health`);
    });

    // Graceful shutdown
    const matikanGraceful = async (sinyal) => {
      logger.info(`📶 Menerima sinyal ${sinyal}. Mematikan server...`);

      // Matikan bot Telegram
      await matikanBot();

      server.close(async () => {
        logger.info('🔴 HTTP server ditutup');

        try {
          await prisma.$disconnect();
          logger.info('🔴 Koneksi database ditutup');
        } catch (error) {
          logger.error('Error saat menutup koneksi database:', error);
        }

        process.exit(0);
      });

      // Paksa matikan setelah 10 detik
      setTimeout(() => {
        logger.error('⏰ Paksa matikan setelah timeout');
        process.exit(1);
      }, 10000);
    };

    // Tangani sinyal shutdown
    process.on('SIGTERM', () => matikanGraceful('SIGTERM'));
    process.on('SIGINT', () => matikanGraceful('SIGINT'));

    // Tangani unhandled rejection
    process.on('unhandledRejection', (reason, _promise) => {
      logger.error('Unhandled Rejection:', reason);
      // TODO: Di production, bisa restart process atau kirim ke monitoring
    });

    // Tangani uncaught exception
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      matikanGraceful('uncaughtException');
    });

    return server;
  } catch (error) {
    logger.error('❌ Gagal memulai server:', error);
    process.exit(1);
  }
};

// Jalankan server jika file ini dieksekusi langsung
if (require.main === module) {
  mulaiServer();
}

module.exports = mulaiServer;
