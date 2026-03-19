const { Router } = require('express');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

/**
 * POST /api/v1/json/format
 * Format JSON (pretty print) (butuh API key)
 */
router.post('/format', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { json, indent } = req.body;

    if (!json) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "json" wajib diisi',
      });
    }

    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      const spasi = Math.min(Math.max(parseInt(indent) || 2, 1), 8);
      const formatted = JSON.stringify(parsed, null, spasi);

      return responsBerhasil(res, {
        pesan: 'JSON berhasil diformat',
        data: {
          formatted,
          valid: true,
          ukuran: formatted.length,
        },
      });
    } catch (parseError) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'JSON tidak valid',
        errors: [{ field: 'json', pesan: parseError.message }],
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/json/minify
 * Minify JSON (butuh API key)
 */
router.post('/minify', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { json } = req.body;

    if (!json) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "json" wajib diisi',
      });
    }

    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      const minified = JSON.stringify(parsed);

      return responsBerhasil(res, {
        pesan: 'JSON berhasil diminify',
        data: {
          minified,
          valid: true,
          ukuran: minified.length,
          pengurangan: typeof json === 'string' ? json.length - minified.length : 0,
        },
      });
    } catch (parseError) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'JSON tidak valid',
        errors: [{ field: 'json', pesan: parseError.message }],
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/json/validasi
 * Validasi JSON (butuh API key)
 */
router.post('/validasi', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { json } = req.body;

    if (!json) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "json" wajib diisi',
      });
    }

    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      const isArray = Array.isArray(parsed);
      const isObject = typeof parsed === 'object' && parsed !== null && !isArray;

      return responsBerhasil(res, {
        pesan: 'JSON valid',
        data: {
          valid: true,
          tipe: isArray ? 'array' : isObject ? 'object' : typeof parsed,
          jumlahKeys: isObject ? Object.keys(parsed).length : null,
          jumlahItems: isArray ? parsed.length : null,
          ukuran: JSON.stringify(parsed).length,
        },
      });
    } catch (parseError) {
      return responsBerhasil(res, {
        pesan: 'JSON tidak valid',
        data: {
          valid: false,
          error: parseError.message,
          posisi: parseError.message.match(/position (\d+)/)?.[1] || null,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/json/escape
 * Escape string untuk JSON (butuh API key)
 */
router.post('/escape', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks } = req.body;

    if (!teks) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "teks" wajib diisi',
      });
    }

    const escaped = JSON.stringify(teks).slice(1, -1);

    return responsBerhasil(res, {
      pesan: 'String berhasil di-escape',
      data: {
        asli: teks,
        escaped,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
