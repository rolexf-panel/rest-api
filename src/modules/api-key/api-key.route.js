const { Router } = require('express');
const { autentikasi } = require('../../middlewares/autentikasi');
const {
  buatApiKey,
  daftarApiKey,
  nonaktifkanApiKey,
  hapusApiKey,
  aktifkanApiKey,
  regenerasiApiKey,
} = require('./api-key.service');
const { responsBerhasil, responsError } = require('../../utils/respons');

const router = Router();

router.post('/', autentikasi, async (req, res, next) => {
  try {
    const { nama } = req.body;
    const apiKey = await buatApiKey(req.user.id, nama || 'API Key Utama');

    return responsBerhasil(
      res,
      {
        pesan: 'API key berhasil dibuat',
        data: {
          id: apiKey.id,
          nama: apiKey.nama,
          kunci: apiKey.kunci,
          kunciPrefix: apiKey.kunciPrefix,
          aktif: apiKey.aktif,
          createdAt: apiKey.createdAt,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
});

router.get('/', autentikasi, async (req, res, next) => {
  try {
    const keys = await daftarApiKey(req.user.id);

    return responsBerhasil(res, {
      pesan: 'Daftar API key berhasil diambil',
      data: keys,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/regenerate', autentikasi, async (req, res, next) => {
  try {
    const apiKey = await regenerasiApiKey(req.user.id, req.params.id);

    if (!apiKey) {
      return responsError(res, 404, 'API key tidak ditemukan');
    }

    return responsBerhasil(res, {
      pesan: 'API key berhasil diregenerasi',
      data: {
        id: apiKey.id,
        nama: apiKey.nama,
        kunci: apiKey.kunci,
        kunciPrefix: apiKey.kunciPrefix,
        aktif: apiKey.aktif,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/aktifkan', autentikasi, async (req, res, next) => {
  try {
    const apiKey = await aktifkanApiKey(req.user.id, req.params.id);

    if (!apiKey) {
      return responsError(res, 404, 'API key tidak ditemukan');
    }

    return responsBerhasil(res, {
      pesan: 'API key berhasil diaktifkan',
      data: { id: apiKey.id, aktif: apiKey.aktif },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/nonaktifkan', autentikasi, async (req, res, next) => {
  try {
    const apiKey = await nonaktifkanApiKey(req.user.id, req.params.id);

    if (!apiKey) {
      return responsError(res, 404, 'API key tidak ditemukan');
    }

    return responsBerhasil(res, {
      pesan: 'API key berhasil dinonaktifkan',
      data: { id: apiKey.id, aktif: apiKey.aktif },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', autentikasi, async (req, res, next) => {
  try {
    const apiKey = await hapusApiKey(req.user.id, req.params.id);

    if (!apiKey) {
      return responsError(res, 404, 'API key tidak ditemukan');
    }

    return responsBerhasil(
      res,
      {
        pesan: 'API key berhasil dihapus',
      },
      204
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
