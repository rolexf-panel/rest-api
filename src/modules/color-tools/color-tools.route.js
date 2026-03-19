const { Router } = require('express');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

/**
 * POST /api/v1/color/hex-ke-rgb
 * Konversi HEX ke RGB (butuh API key)
 */
router.post('/hex-ke-rgb', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { hex } = req.body;

    if (!hex) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "hex" wajib diisi',
      });
    }

    // Bersihkan input
    let cleanHex = hex.replace('#', '');

    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split('')
        .map((c) => c + c)
        .join('');
    }

    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Format HEX tidak valid',
      });
    }

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return responsBerhasil(res, {
      pesan: 'Konversi berhasil',
      data: {
        hex: `#${cleanHex.toLowerCase()}`,
        rgb: { r, g, b },
        rgbString: `rgb(${r}, ${g}, ${b})`,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/color/rgb-ke-hex
 * Konversi RGB ke HEX (butuh API key)
 */
router.post('/rgb-ke-hex', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { r, g, b } = req.body;

    if (r === undefined || g === undefined || b === undefined) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "r", "g", dan "b" wajib diisi',
      });
    }

    const toHex = (n) => {
      const hex = Math.max(0, Math.min(255, n)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

    return responsBerhasil(res, {
      pesan: 'Konversi berhasil',
      data: {
        rgb: { r, g, b },
        hex: hex.toLowerCase(),
        hexUpper: hex.toUpperCase(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/color/random
 * Generate warna random (butuh API key)
 */
router.get('/random', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const randomHex = () =>
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
    const hex = `#${randomHex()}`;
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    return responsBerhasil(res, {
      pesan: 'Warna random berhasil dibuat',
      data: {
        hex,
        rgb: { r, g, b },
        rgbString: `rgb(${r}, ${g}, ${b})`,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/color/palet
 * Generate palet warna (butuh API key)
 */
router.post('/palet', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { jumlah = 5 } = req.body;
    const count = Math.min(Math.max(jumlah, 2), 10);
    const palet = [];

    for (let i = 0; i < count; i++) {
      const hex = `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`;
      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);
      palet.push({ hex, rgb: { r, g, b } });
    }

    return responsBerhasil(res, {
      pesan: 'Palet warna berhasil dibuat',
      data: {
        palet,
        jumlah: palet.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
