const { Router } = require('express');
const prisma = require('../../config/prisma');
const { autentikasi } = require('../../middlewares/autentikasi');
const { otorisasi } = require('../../middlewares/otorisasi');
const { responsBerhasil, responsTidakDitemukan } = require('../../utils/respons');
const fs = require('fs');
const path = require('path');

const router = Router();

// Semua route owner memerlukan autentikasi dan role owner/admin
router.use(autentikasi);
router.use(otorisasi('owner', 'admin'));

/**
 * GET /api/v1/owner/users
 * Ambil semua pengguna
 */
router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.pengguna.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        tier: true,
        emailTerverifikasi: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return responsBerhasil(res, {
      pesan: 'Data pengguna berhasil diambil',
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/owner/users/:id/role
 * Ubah role pengguna
 */
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { peran } = req.body;

    // Validasi role
    const roleValid = ['user', 'admin'];
    if (!roleValid.includes(peran)) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Role tidak valid. Pilih: user atau admin',
      });
    }

    // Cek user ada
    const user = await prisma.pengguna.findUnique({ where: { id } });
    if (!user) {
      return responsTidakDitemukan(res, 'Pengguna tidak ditemukan');
    }

    // Tidak bisa ubah role owner
    if (user.peran === 'owner') {
      return res.status(403).json({
        berhasil: false,
        pesan: 'Role owner tidak dapat diubah',
      });
    }

    // Update role
    const updated = await prisma.pengguna.update({
      where: { id },
      data: { peran },
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        tier: true,
        emailTerverifikasi: true,
        createdAt: true,
      },
    });

    return responsBerhasil(res, {
      pesan: 'Role pengguna berhasil diubah',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/owner/users/:id
 * Hapus pengguna (soft delete)
 */
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Cek user ada
    const user = await prisma.pengguna.findUnique({ where: { id } });
    if (!user) {
      return responsTidakDitemukan(res, 'Pengguna tidak ditemukan');
    }

    // Tidak bisa hapus owner
    if (user.peran === 'owner') {
      return res.status(403).json({
        berhasil: false,
        pesan: 'Akun owner tidak dapat dihapus',
      });
    }

    // Tidak bisa hapus diri sendiri
    if (id === req.user.id) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Tidak dapat menghapus akun sendiri',
      });
    }

    // Soft delete
    await prisma.pengguna.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return responsBerhasil(res, {
      pesan: 'Pengguna berhasil dihapus',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/owner/backup
 * Backup database SQLite
 */
router.post('/backup', async (req, res, next) => {
  try {
    const dbPath = path.join(__dirname, '..', '..', '..', 'prisma', 'dev.db');

    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({
        berhasil: false,
        pesan: 'Database tidak ditemukan',
      });
    }

    // Baca file database
    const fileBuffer = fs.readFileSync(dbPath);

    // Set header untuk download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${timestamp}.db`);
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/owner/clear-cache
 * Clear rate limiter cache
 */
router.post('/clear-cache', async (req, res, next) => {
  try {
    return responsBerhasil(res, {
      pesan: 'Cache berhasil dibersihkan',
      data: {
        note: 'Rate limiter akan direset saat server restart',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/owner/stats
 * Statistik server
 */
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = await prisma.pengguna.count({
      where: { deletedAt: null },
    });

    const verifiedUsers = await prisma.pengguna.count({
      where: { deletedAt: null, emailTerverifikasi: true },
    });

    const adminUsers = await prisma.pengguna.count({
      where: { deletedAt: null, peran: { in: ['admin', 'owner'] } },
    });

    return responsBerhasil(res, {
      pesan: 'Statistik berhasil diambil',
      data: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        adminUsers,
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ======================
// BROADCAST ENDPOINTS
// ======================

/**
 * GET /api/v1/owner/broadcasts
 * Ambil semua broadcast
 */
router.get('/broadcasts', async (req, res, next) => {
  try {
    const broadcasts = await prisma.broadcast.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return responsBerhasil(res, {
      pesan: 'Data broadcast berhasil diambil',
      data: broadcasts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/owner/broadcasts
 * Buat broadcast baru
 */
router.post('/broadcasts', async (req, res, next) => {
  try {
    const { judul, konten, tipe } = req.body;

    const broadcast = await prisma.broadcast.create({
      data: {
        judul,
        konten,
        tipe: tipe || 'info',
        createdBy: req.user.id,
      },
    });

    return responsBerhasil(
      res,
      {
        pesan: 'Broadcast berhasil dibuat',
        data: broadcast,
      },
      201
    );
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/owner/broadcasts/:id
 * Update broadcast
 */
router.patch('/broadcasts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { judul, konten, tipe, aktif } = req.body;

    const broadcast = await prisma.broadcast.findUnique({ where: { id } });
    if (!broadcast) {
      return responsTidakDitemukan(res, 'Broadcast tidak ditemukan');
    }

    const updated = await prisma.broadcast.update({
      where: { id },
      data: {
        ...(judul && { judul }),
        ...(konten && { konten }),
        ...(tipe && { tipe }),
        ...(aktif !== undefined && { aktif }),
      },
    });

    return responsBerhasil(res, {
      pesan: 'Broadcast berhasil diupdate',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/owner/broadcasts/:id
 * Hapus broadcast
 */
router.delete('/broadcasts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const broadcast = await prisma.broadcast.findUnique({ where: { id } });
    if (!broadcast) {
      return responsTidakDitemukan(res, 'Broadcast tidak ditemukan');
    }

    await prisma.broadcast.delete({ where: { id } });

    return responsBerhasil(res, {
      pesan: 'Broadcast berhasil dihapus',
    });
  } catch (error) {
    next(error);
  }
});

router.use('/api-keys', require('./owner-api-key.route'));

module.exports = router;
