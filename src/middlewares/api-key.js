const { PrismaClient } = require('@prisma/client');
const konfigurasi = require('../config');

const prisma = new PrismaClient();

const IP_WHITELIST = ['182.8.161.20', '127.0.0.1', '::1', '::ffff:127.0.0.1'];

function isIpWhitelisted(ip) {
  return IP_WHITELIST.includes(ip) || ip.startsWith('::ffff:');
}

async function autentikasiApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        berhasil: false,
        pesan: 'API key diperlukan. Gunakan header X-API-Key',
      });
    }

    const keyData = await prisma.apiKey.findUnique({
      where: { kunci: apiKey },
      include: { pengguna: true },
    });

    if (!keyData) {
      return res.status(401).json({
        berhasil: false,
        pesan: 'API key tidak valid',
      });
    }

    if (!keyData.aktif) {
      return res.status(401).json({
        berhasil: false,
        pesan: 'API key telah dinonaktifkan',
      });
    }

    await prisma.apiKey.update({
      where: { id: keyData.id },
      data: { terakhirDigunakan: new Date() },
    });

    req.apiKey = keyData;
    req.pengguna = keyData.pengguna;
    req.tier = keyData.pengguna.tier;
    req.peran = keyData.pengguna.peran;

    next();
  } catch (error) {
    console.error('Error autentikasi API key:', error);
    return res.status(500).json({
      berhasil: false,
      pesan: 'Terjadi kesalahan server',
    });
  }
}

function pilihRateLimiter(req) {
  const tier = req.tier || 'free';
  const { rateLimiterFree, rateLimiterPaid } = require('../config/rate-limiter');
  return tier === 'premium' || tier === 'paid' ? rateLimiterPaid : rateLimiterFree;
}

function rateLimiterMiddleware(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress;

  if (isIpWhitelisted(clientIp)) {
    return next();
  }

  const limiter = pilihRateLimiter(req);

  limiter
    .consume(req.apiKey?.kunci || req.ip)
    .then(() => next())
    .catch(() => {
      const tier = req.tier || 'free';
      const limit = tier === 'premium' || tier === 'paid' ? '1000' : '100';
      res.status(429).json({
        berhasil: false,
        pesan: `Terlalu banyak permintaan. Batas: ${limit} request per 15 menit`,
      });
    });
}

module.exports = {
  autentikasiApiKey,
  rateLimiterMiddleware,
};
