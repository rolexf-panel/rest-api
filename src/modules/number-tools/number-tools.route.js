const { Router } = require('express');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

/**
 * POST /api/v1/number/random
 * Generate angka random (butuh API key)
 */
router.post('/random', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { min = 0, max = 100, jumlah = 1, bulat = true } = req.body;

    if (min >= max) {
      return res.status(400).json({
        berhasil: false,
        pesan: '"min" harus lebih kecil dari "max"',
      });
    }

    const count = Math.min(Math.max(jumlah, 1), 100);
    const hasil = [];

    for (let i = 0; i < count; i++) {
      const num = Math.random() * (max - min) + min;
      hasil.push(bulat ? Math.floor(num) : parseFloat(num.toFixed(2)));
    }

    return responsBerhasil(res, {
      pesan: 'Angka random berhasil dibuat',
      data: {
        hasil: count === 1 ? hasil[0] : hasil,
        min,
        max,
        jumlah: count,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/number/format
 * Format angka (Rupiah, separator, dll) (butuh API key)
 */
router.post('/format', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { angka, tipe, mataUang } = req.body;

    if (angka === undefined) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "angka" wajib diisi',
      });
    }

    const tipeFormat = tipe || 'separator';
    let hasil;

    switch (tipeFormat) {
      case 'separator':
        hasil = new Intl.NumberFormat('id-ID').format(angka);
        break;
      case 'rupiah':
        hasil = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: mataUang || 'IDR',
        }).format(angka);
        break;
      case 'persen':
        hasil = new Intl.NumberFormat('id-ID', {
          style: 'percent',
          minimumFractionDigits: 2,
        }).format(angka / 100);
        break;
      case 'compact':
        hasil = new Intl.NumberFormat('id-ID', {
          notation: 'compact',
          compactDisplay: 'short',
        }).format(angka);
        break;
      default:
        hasil = angka.toString();
    }

    return responsBerhasil(res, {
      pesan: 'Format berhasil',
      data: {
        angkaAsli: angka,
        tipe: tipeFormat,
        hasil,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/number/kalkulasi
 * Kalkulasi matematika dasar (butuh API key)
 */
router.post('/kalkulasi', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { operasi, a, b } = req.body;

    if (!operasi || a === undefined || b === undefined) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "operasi", "a", dan "b" wajib diisi',
      });
    }

    let hasil;
    const operasiValid = ['tambah', 'kurang', 'kali', 'bagi', 'pangkat', 'modulo', 'akar'];

    if (!operasiValid.includes(operasi)) {
      return res.status(400).json({
        berhasil: false,
        pesan: `Operasi tidak valid. Pilihan: ${operasiValid.join(', ')}`,
      });
    }

    switch (operasi) {
      case 'tambah':
        hasil = a + b;
        break;
      case 'kurang':
        hasil = a - b;
        break;
      case 'kali':
        hasil = a * b;
        break;
      case 'bagi':
        if (b === 0) {
          return res.status(400).json({
            berhasil: false,
            pesan: 'Tidak bisa dibagi dengan nol',
          });
        }
        hasil = a / b;
        break;
      case 'pangkat':
        hasil = Math.pow(a, b);
        break;
      case 'modulo':
        hasil = a % b;
        break;
      case 'akar':
        hasil = Math.pow(a, 1 / b);
        break;
    }

    return responsBerhasil(res, {
      pesan: 'Kalkulasi berhasil',
      data: {
        operasi,
        a,
        b,
        hasil: parseFloat(hasil.toFixed(10)),
        ekspresi: `${a} ${operasi} ${b} = ${hasil}`,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/number/fibonacci/:n
 * Generate deret Fibonacci (butuh API key)
 */
router.get('/fibonacci/:n', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const n = Math.min(parseInt(req.params.n) || 10, 50);
    const deret = [0, 1];

    for (let i = 2; i < n; i++) {
      deret.push(deret[i - 1] + deret[i - 2]);
    }

    return responsBerhasil(res, {
      pesan: 'Deret Fibonacci berhasil dibuat',
      data: {
        deret: deret.slice(0, n),
        jumlah: n,
        total: deret.reduce((a, b) => a + b, 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
