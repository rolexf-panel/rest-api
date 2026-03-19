const { Router } = require('express');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { buatBratImage, buatBratVid } = require('./brat.service');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

router.post('/brat', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks } = req.body;

    const result = await buatBratImage(teks || 'BRAT');

    return responsBerhasil(res, {
      pesan: 'Brat image berhasil dibuat',
      data: {
        url: result.url,
        namaFile: result.namaFile,
        format: result.format,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/bratvid', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks } = req.body;

    const result = await buatBratVid(teks || 'BRAT');

    return responsBerhasil(res, {
      pesan: 'Brat video berhasil dibuat',
      data: {
        url: result.url,
        namaFile: result.namaFile,
        format: result.format,
        width: result.width,
        height: result.height,
        duration: result.duration,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
