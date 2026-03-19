const { Router } = require('express');
const prisma = require('../config/prisma');
const konfigurasi = require('../config');
const { responsBerhasil } = require('../utils/respons');

const router = Router();

/**
 * Health check endpoint
 * Digunakan untuk memantau status API dan koneksi database
 */
router.get('/health', async (req, res) => {
  let dbStatus = 'terhubung';

  try {
    // Periksa koneksi database
    await prisma.$queryRaw`SELECT 1`;
  } catch (_error) {
    dbStatus = 'terputus';
  }

  const responseData = {
    status: dbStatus === 'terhubung' ? 'sehat' : 'tidak sehat',
    versi: '1.0.0',
    environment: konfigurasi.env,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  };

  if (dbStatus === 'terhubung') {
    return responsBerhasil(res, {
      pesan: 'API berjalan dengan baik',
      data: responseData,
    });
  }

  return res.status(503).json({
    berhasil: false,
    pesan: 'API tidak sehat - database terputus',
    data: responseData,
  });
});

/**
 * GET /api/v1/broadcast
 * Ambil broadcast aktif (publik)
 */
router.get('/broadcast', async (req, res, next) => {
  try {
    const broadcasts = await prisma.broadcast.findMany({
      where: { aktif: true },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    return responsBerhasil(res, {
      pesan: 'Broadcast berhasil diambil',
      data: broadcasts.length > 0 ? broadcasts[0] : null,
    });
  } catch (error) {
    next(error);
  }
});

// ======================
// Mount sub-routes
// ======================

// API Key Management (JWT auth - for dashboard)
router.use('/api-key', require('../modules/api-key/api-key.route'));

// Autentikasi & Profil (JWT auth - for dashboard)
router.use('/auth', require('../modules/autentikasi/autentikasi.route'));

// Owner/Admin Panel
router.use('/owner', require('../modules/owner/owner.route'));

// URL Shortener
router.use('/url', require('../modules/url-shortener/url-shortener.route'));

// Tools Teks
router.use('/tools', require('../modules/tools-teks/tools-teks.route'));

// QR Code
router.use('/qr', require('../modules/qr-code/qr-code.route'));

// Catatan
router.use('/catatan', require('../modules/catatan/catatan.route'));

// Info Jaringan
router.use('/jaringan', require('../modules/info-jaringan/info-jaringan.route'));

// Cuaca
router.use('/cuaca', require('../modules/cuaca/cuaca.route'));

// Mata Uang
router.use('/mata-uang', require('../modules/mata-uang/mata-uang.route'));

// Password Generator
router.use('/password', require('../modules/password-generator/password-generator.route'));

// Lorem Ipsum Generator
router.use('/lorem', require('../modules/lorem-ipsum/lorem-ipsum.route'));

// Timestamp Converter
router.use('/timestamp', require('../modules/timestamp-converter/timestamp-converter.route'));

// JSON Tools
router.use('/json', require('../modules/json-tools/json-tools.route'));

// String Utilities
router.use('/string', require('../modules/string-utils/string-utils.route'));

// Color Tools
router.use('/color', require('../modules/color-tools/color-tools.route'));

// Number Tools
router.use('/number', require('../modules/number-tools/number-tools.route'));

// Brat Generator
router.use('/brat', require('../modules/brat/brat.route'));

module.exports = router;
