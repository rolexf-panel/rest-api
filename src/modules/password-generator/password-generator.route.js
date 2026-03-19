const { Router } = require('express');
const crypto = require('crypto');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

/**
 * POST /api/v1/password/generate
 * Generate kata sandi kuat (butuh API key)
 */
router.post('/generate', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const {
      panjang = 16,
      hurufBesar = true,
      hurufKecil = true,
      angka = true,
      simbol = true,
      excludeAmbiguous = false,
    } = req.body;

    // Validasi panjang
    if (panjang < 4 || panjang > 128) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Panjang kata sandi harus antara 4-128 karakter',
      });
    }

    // Karakter yang tersedia
    let chars = '';
    const hurufBesarChars = excludeAmbiguous
      ? 'ABCDEFGHJKLMNPQRSTUVWXYZ'
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const hurufKecilChars = excludeAmbiguous
      ? 'abcdefghjkmnpqrstuvwxyz'
      : 'abcdefghijklmnopqrstuvwxyz';
    const angkaChars = excludeAmbiguous ? '23456789' : '0123456789';
    const simbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (hurufBesar) chars += hurufBesarChars;
    if (hurufKecil) chars += hurufKecilChars;
    if (angka) chars += angkaChars;
    if (simbol) chars += simbolChars;

    if (chars.length === 0) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Minimal satu tipe karakter harus dipilih',
      });
    }

    // Generate password menggunakan crypto.randomBytes
    const randomBytes = crypto.randomBytes(panjang);
    let password = '';

    for (let i = 0; i < panjang; i++) {
      password += chars[randomBytes[i] % chars.length];
    }

    // Hitung kekuatan password
    let skor = 0;
    if (panjang >= 8) skor++;
    if (panjang >= 12) skor++;
    if (panjang >= 16) skor++;
    if (hurufBesar && hurufKecil) skor++;
    if (angka) skor++;
    if (simbol) skor++;

    const kekuatanLabels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
    const kekuatan = kekuatanLabels[Math.min(skor, 4)];

    return responsBerhasil(res, {
      pesan: 'Kata sandi berhasil dibuat',
      data: {
        password,
        panjang: password.length,
        kekuatan,
        skor,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/password/cek-kekuatan
 * Cek kekuatan kata sandi (butuh API key)
 */
router.post('/cek-kekuatan', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { kataSandi } = req.body;

    if (!kataSandi) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "kataSandi" wajib diisi',
      });
    }

    const checks = {
      panjangMinimal: kataSandi.length >= 8,
      adaHurufBesar: /[A-Z]/.test(kataSandi),
      adaHurufKecil: /[a-z]/.test(kataSandi),
      adaAngka: /[0-9]/.test(kataSandi),
      adaSimbol: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(kataSandi),
      panjang12Plus: kataSandi.length >= 12,
    };

    let skor = 0;
    if (checks.panjangMinimal) skor++;
    if (checks.adaHurufBesar) skor++;
    if (checks.adaHurufKecil) skor++;
    if (checks.adaAngka) skor++;
    if (checks.adaSimbol) skor++;
    if (checks.panjang12Plus) skor++;

    const kekuatanLabels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
    const kekuatanIndex = Math.min(Math.floor(skor / 1.5), 4);
    const kekuatan = kekuatanLabels[kekuatanIndex];

    return responsBerhasil(res, {
      pesan: 'Analisis kekuatan kata sandi',
      data: {
        kataSandi: kataSandi.replace(/./g, '*'), // Sembunyikan kata sandi
        panjang: kataSandi.length,
        checks,
        skor,
        maksimalSkor: 6,
        kekuatan,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
