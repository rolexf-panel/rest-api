const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const konfigurasi = require('../../config');
const { hashKataSandi, verifikasiKataSandi } = require('../../utils/hash');
const {
  ConflictError,
  AuthenticationError,
  NotFoundError,
  AppError,
} = require('../../utils/error-kustom');
const model = require('./autentikasi.model');

/**
 * Service autentikasi
 * Semua logika bisnis terkait autentikasi ada di sini
 */

/**
 * Generate access token JWT
 * @param {Object} pengguna - Data pengguna
 * @returns {string} JWT token
 */
const generateAccessToken = (pengguna) => {
  return jwt.sign(
    {
      id: pengguna.id,
      email: pengguna.email,
      peran: pengguna.peran,
      tier: pengguna.tier,
    },
    konfigurasi.jwt.secret,
    { expiresIn: konfigurasi.jwt.expiresIn },
  );
};

/**
 * Generate refresh token JWT
 * @param {Object} pengguna - Data pengguna
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (pengguna) => {
  return jwt.sign(
    {
      id: pengguna.id,
      tipe: 'refresh',
    },
    konfigurasi.jwt.refreshSecret,
    { expiresIn: konfigurasi.jwt.refreshExpiresIn },
  );
};

/**
 * Generate kode verifikasi unik
 * @returns {string} Kode verifikasi 8 karakter
 */
const generateKodeVerifikasi = () => {
  return `VERIF_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

/**
 * Generate token reset kata sandi
 * @returns {string} Token reset unik
 */
const generateTokenReset = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Parse durasi JWT ke detik
 * @param {string} durasi - Format: "15m", "7d", "1h"
 * @returns {number} Durasi dalam detik
 */
const parseDurasi = (durasi) => {
  const match = durasi.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // default 15 menit

  const nilai = parseInt(match[1]);
  const satuan = match[2];

  switch (satuan) {
    case 's':
      return nilai;
    case 'm':
      return nilai * 60;
    case 'h':
      return nilai * 3600;
    case 'd':
      return nilai * 86400;
    default:
      return 900;
  }
};

/**
 * Registrasi pengguna baru
 * @param {Object} data - { email, kataSandi, nama }
 * @returns {Promise<Object>}
 */
const register = async ({ email, kataSandi, nama }) => {
  // Cek email sudah terdaftar
  const penggunaAda = await model.cariByEmail(email);
  if (penggunaAda) {
    throw new ConflictError('Email sudah terdaftar');
  }

  // Hash kata sandi
  const kataSandiHash = await hashKataSandi(kataSandi);

  // Generate kode verifikasi
  const kodeVerifikasi = generateKodeVerifikasi();
  const kedaluwarsaVerifikasi = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

  // Buat pengguna baru
  const pengguna = await model.buat({
    email,
    kataSandi: kataSandiHash,
    nama,
    tokenVerifikasi: kodeVerifikasi,
  });

  // Generate link verifikasi Telegram
  const botUsername = konfigurasi.external?.telegramBotUsername || 'restapi_verfication_bot';
  const verifikasiLink = `https://t.me/${botUsername}?start=${kodeVerifikasi}`;

  return {
    ...pengguna,
    verifikasiLink,
    verifikasiKedaluwarsa: kedaluwarsaVerifikasi.toISOString(),
  };
};

/**
 * Login pengguna
 * @param {Object} data - { email, kataSandi }
 * @returns {Promise<Object>}
 */
const login = async ({ email, kataSandi }) => {
  // Cari pengguna
  const pengguna = await model.cariByEmail(email);
  if (!pengguna) {
    throw new AuthenticationError('Email atau kata sandi salah');
  }

  // Cek akun aktif
  if (pengguna.deletedAt) {
    throw new AuthenticationError('Akun sudah dinonaktifkan');
  }

  // Verifikasi kata sandi
  const kataSandiValid = await verifikasiKataSandi(kataSandi, pengguna.kataSandi);
  if (!kataSandiValid) {
    throw new AuthenticationError('Email atau kata sandi salah');
  }

  // Generate tokens
  const accessToken = generateAccessToken(pengguna);
  const refreshToken = generateRefreshToken(pengguna);

  return {
    accessToken,
    refreshToken,
    expiresIn: parseDurasi(konfigurasi.jwt.expiresIn),
    pengguna: {
      id: pengguna.id,
      email: pengguna.email,
      nama: pengguna.nama,
      peran: pengguna.peran,
      tier: pengguna.tier,
      emailTerverifikasi: pengguna.emailTerverifikasi,
    },
  };
};

/**
 * Logout pengguna (blacklist token)
 * @param {string} token - Access token
 * @returns {Promise<void>}
 */
const logout = async (token) => {
  // Decode token untuk dapatkan waktu kedaluwarsa
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) {
    throw new AppError('Token tidak valid', 400);
  }

  // Tambahkan ke blacklist
  const kedaluwarsa = new Date(decoded.exp * 1000);
  await model.blacklistToken(token, kedaluwarsa);
};

/**
 * Refresh access token
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshToken = async (token) => {
  try {
    // Verifikasi refresh token
    const decoded = jwt.verify(token, konfigurasi.jwt.refreshSecret);

    // Pastikan ini refresh token
    if (decoded.tipe !== 'refresh') {
      throw new AuthenticationError('Token tidak valid');
    }

    // Cari pengguna
    const pengguna = await model.cariById(decoded.id);
    if (!pengguna) {
      throw new AuthenticationError('Pengguna tidak ditemukan');
    }

    // Generate access token baru
    const accessToken = generateAccessToken(pengguna);

    return {
      accessToken,
      expiresIn: parseDurasi(konfigurasi.jwt.expiresIn),
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Refresh token tidak valid atau sudah kedaluwarsa');
    }
    throw error;
  }
};

/**
 * Ambil profil pengguna
 * @param {string} id - ID pengguna
 * @returns {Promise<Object>}
 */
const getProfil = async (id) => {
  const pengguna = await model.cariById(id);
  if (!pengguna) {
    throw new NotFoundError('Pengguna tidak ditemukan');
  }
  return pengguna;
};

/**
 * Update profil pengguna
 * @param {string} id - ID pengguna
 * @param {Object} data - Data yang akan diupdate
 * @returns {Promise<Object>}
 */
const updateProfil = async (id, data) => {
  const pengguna = await model.cariById(id);
  if (!pengguna) {
    throw new NotFoundError('Pengguna tidak ditemukan');
  }

  return model.update(id, data);
};

/**
 * Minta reset kata sandi
 * @param {string} email
 * @returns {Promise<Object>}
 */
const lupaKataSandi = async (email) => {
  const pengguna = await model.cariByEmail(email);

  // Selalu return sukses (cegah email enumeration)
  if (!pengguna) {
    return { pesan: 'Jika email terdaftar, link reset telah dikirim' };
  }

  // Generate token reset
  const tokenReset = generateTokenReset();
  const kedaluwarsa = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

  // Simpan token reset
  await model.setTokenReset(email, tokenReset, kedaluwarsa);

  // TODO: Kirim via Telegram bot (implementasi nanti)
  // Saat ini return token untuk testing
  return {
    pesan: 'Jika email terdaftar, link reset telah dikirim',
    // Hapus ini di production:
    debug_token: tokenReset,
    debug_kedaluwarsa: kedaluwarsa.toISOString(),
  };
};

/**
 * Reset kata sandi dengan token
 * @param {string} token
 * @param {string} kataSandiBaru
 * @returns {Promise<Object>}
 */
const resetKataSandi = async (token, kataSandiBaru) => {
  // Hash kata sandi baru
  const kataSandiHash = await hashKataSandi(kataSandiBaru);

  // Reset kata sandi
  const pengguna = await model.resetKataSandi(token, kataSandiHash);

  if (!pengguna) {
    throw new AppError('Token tidak valid atau sudah kedaluwarsa', 400);
  }

  return pengguna;
};

/**
 * Verifikasi email dengan kode
 * @param {string} kodeVerifikasi
 * @returns {Promise<Object>}
 */
const verifikasiEmail = async (kodeVerifikasi) => {
  const pengguna = await model.verifikasiEmail(kodeVerifikasi);

  if (!pengguna) {
    throw new AppError('Kode verifikasi tidak valid atau sudah digunakan', 400);
  }

  return pengguna;
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfil,
  updateProfil,
  lupaKataSandi,
  resetKataSandi,
  verifikasiEmail,
  generateAccessToken,
  generateRefreshToken,
};
