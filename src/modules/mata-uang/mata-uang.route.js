const { Router } = require('express');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

// Data kurs default (fallback jika API tidak tersedia)
const kursDefault = {
  USD: { nama: 'US Dollar', kurs: 1 },
  EUR: { nama: 'Euro', kurs: 0.92 },
  GBP: { nama: 'British Pound', kurs: 0.79 },
  JPY: { nama: 'Japanese Yen', kurs: 149.5 },
  IDR: { nama: 'Indonesian Rupiah', kurs: 15750 },
  SGD: { nama: 'Singapore Dollar', kurs: 1.34 },
  MYR: { nama: 'Malaysian Ringgit', kurs: 4.72 },
  THB: { nama: 'Thai Baht', kurs: 35.5 },
  AUD: { nama: 'Australian Dollar', kurs: 1.53 },
  CAD: { nama: 'Canadian Dollar', kurs: 1.36 },
};

/**
 * GET /api/v1/mata-uang/kurs
 * Daftar kurs mata uang (butuh API key)
 */
router.get('/kurs', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const kursList = Object.entries(kursDefault).map(([kode, data]) => ({
      kode,
      nama: data.nama,
      kurs: data.kurs,
    }));

    return responsBerhasil(res, {
      pesan: 'Data kurs berhasil diambil',
      data: kursList,
      meta: {
        sumber: 'Default',
        terakhirUpdate: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/mata-uang/konversi
 * Konversi mata uang (butuh API key)
 */
router.post('/konversi', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { dari, ke, jumlah } = req.body;

    if (!dari || !ke || jumlah === undefined) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "dari", "ke", dan "jumlah" wajib diisi',
      });
    }

    const dariUpper = dari.toUpperCase();
    const keUpper = ke.toUpperCase();

    if (!kursDefault[dariUpper]) {
      return res.status(400).json({
        berhasil: false,
        pesan: `Mata uang "${dariUpper}" tidak didukung`,
      });
    }

    if (!kursDefault[keUpper]) {
      return res.status(400).json({
        berhasil: false,
        pesan: `Mata uang "${keUpper}" tidak didukung`,
      });
    }

    if (typeof jumlah !== 'number' || jumlah <= 0) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Jumlah harus berupa angka positif',
      });
    }

    const kursDari = kursDefault[dariUpper].kurs;
    const kursKe = kursDefault[keUpper].kurs;
    const hasil = (jumlah / kursDari) * kursKe;

    return responsBerhasil(res, {
      pesan: 'Konversi berhasil',
      data: {
        dari: {
          kode: dariUpper,
          nama: kursDefault[dariUpper].nama,
          jumlah,
        },
        ke: {
          kode: keUpper,
          nama: kursDefault[keUpper].nama,
          jumlah: parseFloat(hasil.toFixed(2)),
        },
        kurs: {
          [dariUpper]: kursDari,
          [keUpper]: kursKe,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/mata-uang/mata-uang-tersedia
 * Daftar mata uang yang didukung (butuh API key)
 */
router.get(
  '/mata-uang-tersedia',
  autentikasiApiKey,
  rateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const mataUang = Object.entries(kursDefault).map(([kode, data]) => ({
        kode,
        nama: data.nama,
      }));

      return responsBerhasil(res, {
        pesan: 'Daftar mata uang berhasil diambil',
        data: mataUang,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
