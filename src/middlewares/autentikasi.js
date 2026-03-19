const jwt = require('jsonwebtoken');
const konfigurasi = require('../config');
const prisma = require('../config/prisma');
const { AuthenticationError } = require('../utils/error-kustom');

/**
 * Middleware autentikasi JWT
 * Memverifikasi token dan menambahkan data pengguna ke request
 */
const autentikasi = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Token tidak ditemukan');
    }

    const token = authHeader.split(' ')[1];

    // Periksa apakah token ada di blacklist
    const tokenDiblokir = await prisma.tokenBlacklist.findUnique({
      where: { token },
    });

    if (tokenDiblokir) {
      throw new AuthenticationError('Token sudah tidak berlaku');
    }

    // Verifikasi token
    const decoded = jwt.verify(token, konfigurasi.jwt.secret);

    // Ambil data pengguna dari database
    const pengguna = await prisma.pengguna.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        tier: true,
        emailTerverifikasi: true,
      },
    });

    if (!pengguna) {
      throw new AuthenticationError('Pengguna tidak ditemukan');
    }

    if (pengguna.deletedAt) {
      throw new AuthenticationError('Akun sudah dinonaktifkan');
    }

    // Tambahkan data pengguna ke request
    req.user = pengguna;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware autentikasi opsional
 * Jika token ada, verifikasi. Jika tidak, lanjutkan tanpa user.
 */
const autentikasiOpsional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    const tokenDiblokir = await prisma.tokenBlacklist.findUnique({
      where: { token },
    });

    if (tokenDiblokir) {
      return next();
    }

    const decoded = jwt.verify(token, konfigurasi.jwt.secret);

    const pengguna = await prisma.pengguna.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        tier: true,
        emailTerverifikasi: true,
      },
    });

    if (pengguna && !pengguna.deletedAt) {
      req.user = pengguna;
    }

    next();
  } catch (_error) {
    // Token tidak valid, lanjutkan tanpa user
    next();
  }
};

module.exports = { autentikasi, autentikasiOpsional };
