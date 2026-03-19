const { Router } = require('express');
const crypto = require('crypto');
const prisma = require('../../config/prisma');
const { autentikasiOpsional } = require('../../middlewares/autentikasi');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil, responsDibuat, responsTidakDitemukan } = require('../../utils/respons');

const router = Router();

/**
 * Generate kode pendek unik
 */
const generateKode = (panjang = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(panjang);
  let kode = '';
  for (let i = 0; i < panjang; i++) {
    kode += chars[bytes[i] % chars.length];
  }
  return kode;
};

/**
 * POST /api/v1/url/shorten
 * Buat URL pendek (butuh API key)
 */
router.post('/shorten', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { urlAsli, judul, kedaluwarsa } = req.body;

    if (!urlAsli) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "urlAsli" wajib diisi',
      });
    }

    try {
      new URL(urlAsli);
    } catch {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Format URL tidak valid',
      });
    }

    let kode = generateKode();
    let existing = await prisma.urlSingkat.findUnique({ where: { kode } });

    while (existing) {
      kode = generateKode();
      existing = await prisma.urlSingkat.findUnique({ where: { kode } });
    }

    let kedaluwarsaDate = null;
    if (kedaluwarsa) {
      kedaluwarsaDate = new Date(Date.now() + kedaluwarsa * 60 * 60 * 1000);
    }

    const urlSingkat = await prisma.urlSingkat.create({
      data: {
        kode,
        urlAsli,
        judul: judul || null,
        penggunaId: req.pengguna?.id || null,
        kedaluwarsa: kedaluwarsaDate,
      },
    });

    const shortUrl = `${req.protocol}://${req.get('host')}/api/v1/url/${kode}`;

    return responsDibuat(res, 'URL berhasil dipersingkat', {
      id: urlSingkat.id,
      kode: urlSingkat.kode,
      urlAsli: urlSingkat.urlAsli,
      urlPendek: shortUrl,
      judul: urlSingkat.judul,
      klik: urlSingkat.klik,
      kedaluwarsa: urlSingkat.kedaluwarsa,
      createdAt: urlSingkat.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/url/:kode
 * Redirect ke URL asli (publik)
 */
router.get('/:kode', async (req, res, next) => {
  try {
    const { kode } = req.params;

    const urlSingkat = await prisma.urlSingkat.findUnique({
      where: { kode },
    });

    if (!urlSingkat || urlSingkat.deletedAt) {
      return res.status(404).json({
        berhasil: false,
        pesan: 'URL tidak ditemukan',
      });
    }

    if (urlSingkat.kedaluwarsa && new Date() > urlSingkat.kedaluwarsa) {
      return res.status(410).json({
        berhasil: false,
        pesan: 'URL sudah kedaluwarsa',
      });
    }

    await prisma.urlSingkat.update({
      where: { id: urlSingkat.id },
      data: { klik: { increment: 1 } },
    });

    return res.redirect(301, urlSingkat.urlAsli);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/url/info/:kode
 * Info statistik URL pendek (butuh API key)
 */
router.get('/info/:kode', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { kode } = req.params;

    const urlSingkat = await prisma.urlSingkat.findUnique({
      where: { kode },
      select: {
        id: true,
        kode: true,
        urlAsli: true,
        judul: true,
        klik: true,
        kedaluwarsa: true,
        createdAt: true,
      },
    });

    if (!urlSingkat) {
      return responsTidakDitemukan(res, 'URL tidak ditemukan');
    }

    return responsBerhasil(res, {
      pesan: 'Info URL berhasil diambil',
      data: {
        ...urlSingkat,
        urlPendek: `${req.protocol}://${req.get('host')}/api/v1/url/${urlSingkat.kode}`,
        sudahKedaluwarsa: urlSingkat.kedaluwarsa ? new Date() > urlSingkat.kedaluwarsa : false,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
