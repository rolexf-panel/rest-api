const { Router } = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { v4: uuidv4, v1: uuidv1, v3: uuidv3, v5: uuidv5 } = require('uuid');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

/**
 * POST /api/v1/tools/hash
 * Hash teks dengan berbagai algoritma (butuh API key)
 */
router.post('/hash', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks, algoritma } = req.body;

    if (!teks) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "teks" wajib diisi',
      });
    }

    const algoritmaTersedia = ['md5', 'sha1', 'sha256', 'sha512', 'bcrypt'];
    const algo = (algoritma || 'sha256').toLowerCase();

    if (!algoritmaTersedia.includes(algo)) {
      return res.status(400).json({
        berhasil: false,
        pesan: `Algoritma tidak valid. Pilihan: ${algoritmaTersedia.join(', ')}`,
      });
    }

    let hasil;

    if (algo === 'bcrypt') {
      hasil = await bcrypt.hash(teks, 10);
    } else {
      hasil = crypto.createHash(algo).update(teks).digest('hex');
    }

    return responsBerhasil(res, {
      pesan: 'Hash berhasil dibuat',
      data: {
        teksAsli: teks,
        algoritma: algo,
        hasil,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/encode
 * Encode teks (Base64 atau URL) (butuh API key)
 */
router.post('/encode', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks, tipe } = req.body;

    if (!teks) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "teks" wajib diisi',
      });
    }

    const tipeValid = ['base64', 'url'];
    const tipeEncode = (tipe || 'base64').toLowerCase();

    if (!tipeValid.includes(tipeEncode)) {
      return res.status(400).json({
        berhasil: false,
        pesan: `Tipe tidak valid. Pilihan: ${tipeValid.join(', ')}`,
      });
    }

    let hasil;

    if (tipeEncode === 'base64') {
      hasil = Buffer.from(teks, 'utf-8').toString('base64');
    } else {
      hasil = encodeURIComponent(teks);
    }

    return responsBerhasil(res, {
      pesan: 'Encode berhasil',
      data: {
        teksAsli: teks,
        tipe: tipeEncode,
        hasil,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tools/decode
 * Decode teks (Base64 atau URL) (butuh API key)
 */
router.post('/decode', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks, tipe } = req.body;

    if (!teks) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "teks" wajib diisi',
      });
    }

    const tipeValid = ['base64', 'url'];
    const tipeDecode = (tipe || 'base64').toLowerCase();

    if (!tipeValid.includes(tipeDecode)) {
      return res.status(400).json({
        berhasil: false,
        pesan: `Tipe tidak valid. Pilihan: ${tipeValid.join(', ')}`,
      });
    }

    let hasil;

    try {
      if (tipeDecode === 'base64') {
        hasil = Buffer.from(teks, 'base64').toString('utf-8');
      } else {
        hasil = decodeURIComponent(teks);
      }
    } catch (_decodeError) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Format input tidak valid untuk decode',
      });
    }

    return responsBerhasil(res, {
      pesan: 'Decode berhasil',
      data: {
        teksTerencode: teks,
        tipe: tipeDecode,
        hasil,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/uuid
 * Generate UUID v4 (default) (butuh API key)
 */
router.get('/uuid', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const hasil = uuidv4();

    return responsBerhasil(res, {
      pesan: 'UUID berhasil dibuat',
      data: {
        uuid: hasil,
        versi: 4,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tools/uuid/:versi
 * Generate UUID dengan versi tertentu (butuh API key)
 */
router.get('/uuid/:versi', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { versi } = req.params;
    const { namespace, name } = req.query;

    let hasil;
    const versiNum = parseInt(versi);

    switch (versiNum) {
      case 1:
        hasil = uuidv1();
        break;
      case 3:
        if (!namespace || !name) {
          return res.status(400).json({
            berhasil: false,
            pesan: 'UUID v3 memerlukan parameter namespace dan name',
          });
        }
        hasil = uuidv3(name, uuidv3.DNS);
        break;
      case 4:
        hasil = uuidv4();
        break;
      case 5:
        if (!namespace || !name) {
          return res.status(400).json({
            berhasil: false,
            pesan: 'UUID v5 memerlukan parameter namespace dan name',
          });
        }
        hasil = uuidv5(name, uuidv5.DNS);
        break;
      default:
        return res.status(400).json({
          berhasil: false,
          pesan: 'Versi UUID tidak valid. Pilihan: 1, 3, 4, 5',
        });
    }

    return responsBerhasil(res, {
      pesan: 'UUID berhasil dibuat',
      data: {
        uuid: hasil,
        versi: versiNum,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
