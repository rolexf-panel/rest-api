const { Router } = require('express');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

/**
 * GET /api/v1/timestamp/now
 * Timestamp saat ini (butuh API key)
 */
router.get('/now', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const now = new Date();

    return responsBerhasil(res, {
      pesan: 'Timestamp berhasil diambil',
      data: {
        unix: Math.floor(now.getTime() / 1000),
        unixMs: now.getTime(),
        iso: now.toISOString(),
        utc: now.toUTCString(),
        locale: now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        timezone: 'Asia/Jakarta',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/timestamp/konversi
 * Konversi timestamp ke tanggal (butuh API key)
 */
router.post('/konversi', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { timestamp } = req.body;

    if (!timestamp && timestamp !== 0) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "timestamp" wajib diisi',
      });
    }

    let date;
    const ts = String(timestamp);

    // Deteksi format timestamp
    if (ts.length === 10) {
      // Unix timestamp (detik)
      date = new Date(parseInt(ts) * 1000);
    } else if (ts.length === 13) {
      // Unix timestamp (milidetik)
      date = new Date(parseInt(ts));
    } else {
      // Coba parse sebagai ISO string
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Format timestamp tidak valid',
      });
    }

    return responsBerhasil(res, {
      pesan: 'Konversi berhasil',
      data: {
        input: timestamp,
        unix: Math.floor(date.getTime() / 1000),
        unixMs: date.getTime(),
        iso: date.toISOString(),
        utc: date.toUTCString(),
        locale: date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        tanggal: date.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' }),
        waktu: date.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/timestamp/durasi
 * Hitung durasi antara dua timestamp (butuh API key)
 */
router.post('/durasi', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { mulai, selesai } = req.body;

    if (!mulai || !selesai) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "mulai" dan "selesai" wajib diisi',
      });
    }

    const start = new Date(mulai.length === 10 ? parseInt(mulai) * 1000 : mulai);
    const end = new Date(selesai.length === 10 ? parseInt(selesai) * 1000 : selesai);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Format timestamp tidak valid',
      });
    }

    const diffMs = Math.abs(end - start);
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    return responsBerhasil(res, {
      pesan: 'Durasi berhasil dihitung',
      data: {
        mulai: start.toISOString(),
        selesai: end.toISOString(),
        milidetik: diffMs,
        detik: diffSeconds,
        menit: diffMinutes,
        jam: diffHours,
        hari: diffDays,
        format: `${diffDays} hari, ${diffHours % 24} jam, ${diffMinutes % 60} menit, ${diffSeconds % 60} detik`,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
