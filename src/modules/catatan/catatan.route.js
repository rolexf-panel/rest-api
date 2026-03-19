const { Router } = require('express');
const prisma = require('../../config/prisma');
const { autentikasi } = require('../../middlewares/autentikasi');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil, responsDibuat, responsTidakDitemukan } = require('../../utils/respons');

const router = Router();

/**
 * POST /api/v1/catatan
 * Buat catatan baru (butuh API key)
 */
router.post('/', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { judul, konten, publik = true, kedaluwarsa } = req.body;

    if (!judul || !konten) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "judul" dan "konten" wajib diisi',
      });
    }

    let kedaluwarsaDate = null;
    if (kedaluwarsa) {
      kedaluwarsaDate = new Date(Date.now() + kedaluwarsa * 60 * 60 * 1000);
    }

    const catatan = await prisma.catatan.create({
      data: {
        judul,
        konten,
        publik,
        kedaluwarsa: kedaluwarsaDate,
        penggunaId: req.pengguna?.id || null,
      },
    });

    return responsDibuat(res, 'Catatan berhasil dibuat', catatan);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/catatan/:id
 * Ambil catatan berdasarkan ID (butuh API key)
 */
router.get('/:id', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const catatan = await prisma.catatan.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!catatan) {
      return responsTidakDitemukan(res, 'Catatan tidak ditemukan');
    }

    if (catatan.kedaluwarsa && new Date() > catatan.kedaluwarsa) {
      return res.status(410).json({
        berhasil: false,
        pesan: 'Catatan sudah kedaluwarsa',
      });
    }

    return responsBerhasil(res, {
      pesan: 'Catatan berhasil diambil',
      data: catatan,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/catatan/:id
 * Update catatan (hanya pemilik)
 */
router.patch('/:id', autentikasi, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { judul, konten, publik } = req.body;

    const catatan = await prisma.catatan.findFirst({
      where: { id, deletedAt: null },
    });

    if (!catatan) {
      return responsTidakDitemukan(res, 'Catatan tidak ditemukan');
    }

    if (!req.user || catatan.penggunaId !== req.user.id) {
      return res.status(403).json({
        berhasil: false,
        pesan: 'Anda tidak memiliki izin untuk mengubah catatan ini',
      });
    }

    const updated = await prisma.catatan.update({
      where: { id },
      data: {
        ...(judul && { judul }),
        ...(konten && { konten }),
        ...(publik !== undefined && { publik }),
      },
    });

    return responsBerhasil(res, {
      pesan: 'Catatan berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/catatan/:id
 * Hapus catatan (soft delete, hanya pemilik)
 */
router.delete('/:id', autentikasi, async (req, res, next) => {
  try {
    const { id } = req.params;

    const catatan = await prisma.catatan.findFirst({
      where: { id, deletedAt: null },
    });

    if (!catatan) {
      return responsTidakDitemukan(res, 'Catatan tidak ditemukan');
    }

    if (!req.user || catatan.penggunaId !== req.user.id) {
      return res.status(403).json({
        berhasil: false,
        pesan: 'Anda tidak memiliki izin untuk menghapus catatan ini',
      });
    }

    await prisma.catatan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return responsBerhasil(res, {
      pesan: 'Catatan berhasil dihapus',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/catatan
 * Ambil daftar catatan publik (butuh API key)
 */
router.get('/', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { halaman = 1, batas = 10 } = req.query;
    const skip = (parseInt(halaman) - 1) * parseInt(batas);

    const [catatan, total] = await Promise.all([
      prisma.catatan.findMany({
        where: {
          publik: true,
          deletedAt: null,
          OR: [{ kedaluwarsa: null }, { kedaluwarsa: { gt: new Date() } }],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(batas),
        select: {
          id: true,
          judul: true,
          konten: true,
          createdAt: true,
        },
      }),
      prisma.catatan.count({
        where: {
          publik: true,
          deletedAt: null,
        },
      }),
    ]);

    return responsBerhasil(res, {
      pesan: 'Daftar catatan berhasil diambil',
      data: catatan,
      meta: {
        halaman: parseInt(halaman),
        batas: parseInt(batas),
        total,
        totalHalaman: Math.ceil(total / parseInt(batas)),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
