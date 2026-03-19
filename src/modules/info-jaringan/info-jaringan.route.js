const { Router } = require('express');
const axios = require('axios');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

/**
 * GET /api/v1/jaringan/ip
 * Ambil IP address dari caller (butuh API key)
 */
router.get('/ip', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.ip;

    return responsBerhasil(res, {
      pesan: 'IP address berhasil diambil',
      data: {
        ip,
        ipv4: ip.replace('::ffff:', ''),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/jaringan/user-agent
 * Ambil informasi user-agent dari caller (butuh API key)
 */
router.get('/user-agent', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const info = {
      raw: userAgent,
      browser: 'Unknown',
      os: 'Unknown',
    };

    if (userAgent.includes('Chrome')) info.browser = 'Chrome';
    else if (userAgent.includes('Firefox')) info.browser = 'Firefox';
    else if (userAgent.includes('Safari')) info.browser = 'Safari';
    else if (userAgent.includes('Edge')) info.browser = 'Edge';
    else if (userAgent.includes('Opera')) info.browser = 'Opera';

    if (userAgent.includes('Windows')) info.os = 'Windows';
    else if (userAgent.includes('Mac')) info.os = 'macOS';
    else if (userAgent.includes('Linux')) info.os = 'Linux';
    else if (userAgent.includes('Android')) info.os = 'Android';
    else if (userAgent.includes('iOS')) info.os = 'iOS';

    return responsBerhasil(res, {
      pesan: 'User-Agent berhasil diambil',
      data: info,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/jaringan/cek-url
 * Cek status URL (up/down) (butuh API key)
 */
router.get('/cek-url', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "url" wajib diisi',
      });
    }

    // Validasi format URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Format URL tidak valid',
      });
    }

    const startTime = Date.now();

    try {
      const response = await axios.head(url, {
        timeout: 10000,
        validateStatus: () => true,
        maxRedirects: 5,
      });

      const responseTime = Date.now() - startTime;

      return responsBerhasil(res, {
        pesan: 'URL berhasil dicek',
        data: {
          url,
          status: response.status,
          up: response.status < 400,
          responseTime: `${responseTime}ms`,
          headers: {
            contentType: response.headers['content-type'],
            server: response.headers['server'],
          },
        },
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return responsBerhasil(res, {
        pesan: 'URL tidak dapat diakses',
        data: {
          url,
          status: error.code || 'TIMEOUT',
          up: false,
          responseTime: `${responseTime}ms`,
          error: error.message,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
