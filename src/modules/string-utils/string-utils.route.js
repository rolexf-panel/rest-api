const { Router } = require('express');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

/**
 * POST /api/v1/string/hitung
 * Hitung karakter, kata, baris (butuh API key)
 */
router.post('/hitung', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks } = req.body;

    if (!teks) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "teks" wajib diisi',
      });
    }

    const karakter = teks.length;
    const karakterTanpaSpasi = teks.replace(/\s/g, '').length;
    const kata = teks
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const baris = teks.split(/\n/).length;
    const paragraf = teks.split(/\n\n+/).filter((p) => p.trim().length > 0).length;

    return responsBerhasil(res, {
      pesan: 'Hitungan berhasil',
      data: {
        karakter,
        karakterTanpaSpasi,
        kata,
        baris,
        paragraf,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/string/ubah-case
 * Ubah case teks (butuh API key)
 */
router.post('/ubah-case', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks, tipe } = req.body;

    if (!teks) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "teks" wajib diisi',
      });
    }

    const tipeValid = [
      'uppercase',
      'lowercase',
      'capitalize',
      'camelCase',
      'snake_case',
      'kebab-case',
    ];
    const tipeCase = tipe || 'lowercase';

    if (!tipeValid.includes(tipeCase)) {
      return res.status(400).json({
        berhasil: false,
        pesan: `Tipe tidak valid. Pilihan: ${tipeValid.join(', ')}`,
      });
    }

    let hasil;

    switch (tipeCase) {
      case 'uppercase':
        hasil = teks.toUpperCase();
        break;
      case 'lowercase':
        hasil = teks.toLowerCase();
        break;
      case 'capitalize':
        hasil = teks.replace(/\b\w/g, (c) => c.toUpperCase());
        break;
      case 'camelCase':
        hasil = teks.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
        break;
      case 'snake_case':
        hasil = teks
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9_]/g, '');
        break;
      case 'kebab-case':
        hasil = teks
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-]/g, '');
        break;
    }

    return responsBerhasil(res, {
      pesan: 'Case berhasil diubah',
      data: {
        asli: teks,
        tipe: tipeCase,
        hasil,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/string/balik
 * Balik teks (butuh API key)
 */
router.post('/balik', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks } = req.body;

    if (!teks) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "teks" wajib diisi',
      });
    }

    return responsBerhasil(res, {
      pesan: 'Teks berhasil dibalik',
      data: {
        asli: teks,
        hasil: teks.split('').reverse().join(''),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/string/truncate
 * Potong teks dengan ellipsis (butuh API key)
 */
router.post('/truncate', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks, panjang, suffix } = req.body;

    if (!teks) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "teks" wajib diisi',
      });
    }

    const maxLen = Math.max(panjang || 50, 3);
    const suf = suffix || '...';

    const hasil = teks.length > maxLen ? teks.substring(0, maxLen - suf.length) + suf : teks;

    return responsBerhasil(res, {
      pesan: 'Teks berhasil dipotong',
      data: {
        asli: teks,
        hasil,
        panjangAsli: teks.length,
        panjangHasil: hasil.length,
        terpotong: teks.length > maxLen,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/string/slug
 * Buat slug dari teks (butuh API key)
 */
router.post('/slug', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks } = req.body;

    if (!teks) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "teks" wajib diisi',
      });
    }

    const slug = teks
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    return responsBerhasil(res, {
      pesan: 'Slug berhasil dibuat',
      data: {
        asli: teks,
        slug,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
