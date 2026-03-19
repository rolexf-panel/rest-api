const { Router } = require('express');
const {
  daftarSemuaApiKey,
  revokeApiKey,
  aktifkanKembaliApiKey,
  hapusApiKeyPermanen,
  getApiKeyStats,
  getRateLimitSettings,
  updateRateLimitSettings,
  getDefaultTier,
  setDefaultTier,
} = require('../api-key/api-key.service');
const { responsBerhasil, responsError } = require('../../utils/respons');

const router = Router();

router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getApiKeyStats();

    return responsBerhasil(res, {
      pesan: 'Statistik API key berhasil diambil',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/rate-limits', async (req, res, next) => {
  try {
    const settings = await getRateLimitSettings();
    const defaultTier = await getDefaultTier();

    return responsBerhasil(res, {
      pesan: 'Pengaturan rate limit berhasil diambil',
      data: {
        limits: settings,
        defaultTier: defaultTier?.paket || 'free',
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/rate-limits', async (req, res, next) => {
  try {
    const { limits, defaultTier } = req.body;

    if (!limits || !Array.isArray(limits)) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "limits" harus berupa array',
      });
    }

    const validPackages = ['free', 'basic', 'premium', 'enterprise'];
    for (const limit of limits) {
      if (!validPackages.includes(limit.paket)) {
        return res.status(400).json({
          berhasil: false,
          pesan: `Paket "${limit.paket}" tidak valid`,
        });
      }
      if (typeof limit.limit !== 'number' || limit.limit < 1 || limit.limit > 100000) {
        return res.status(400).json({
          berhasil: false,
          pesan: `Limit untuk "${limit.paket}" harus berupa angka antara 1-100000`,
        });
      }
    }

    await updateRateLimitSettings(limits);

    if (defaultTier && validPackages.includes(defaultTier)) {
      await setDefaultTier(defaultTier);
    }

    const updatedSettings = await getRateLimitSettings();
    const updatedDefaultTier = await getDefaultTier();

    return responsBerhasil(res, {
      pesan: 'Pengaturan rate limit berhasil disimpan',
      data: {
        limits: updatedSettings,
        defaultTier: updatedDefaultTier?.paket || 'free',
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { limit = 50, halaman = 1 } = req.query;
    const offset = (parseInt(halaman) - 1) * parseInt(limit);

    const { keys, total } = await daftarSemuaApiKey(parseInt(limit), offset);

    return responsBerhasil(res, {
      pesan: 'Daftar API key berhasil diambil',
      data: keys,
      meta: {
        halaman: parseInt(halaman),
        batas: parseInt(limit),
        total,
        totalHalaman: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/revoke', async (req, res, next) => {
  try {
    const { id } = req.params;

    const apiKey = await revokeApiKey(id);

    if (!apiKey) {
      return responsError(res, 404, 'API key tidak ditemukan');
    }

    return responsBerhasil(res, {
      pesan: 'API key berhasil direvoke',
      data: { id: apiKey.id, aktif: apiKey.aktif },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/aktifkan', async (req, res, next) => {
  try {
    const { id } = req.params;

    const apiKey = await aktifkanKembaliApiKey(id);

    if (!apiKey) {
      return responsError(res, 404, 'API key tidak ditemukan');
    }

    return responsBerhasil(res, {
      pesan: 'API key berhasil diaktifkan kembali',
      data: { id: apiKey.id, aktif: apiKey.aktif },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const apiKey = await hapusApiKeyPermanen(id);

    if (!apiKey) {
      return responsError(res, 404, 'API key tidak ditemukan');
    }

    return responsBerhasil(res, {
      pesan: 'API key berhasil dihapus permanen',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
