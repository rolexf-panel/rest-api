const prisma = require('../../config/prisma');

/**
 * Model untuk query database terkait autentikasi
 * Semua query Prisma untuk pengguna ada di sini
 */

// Field yang boleh di-select (tidak termasuk kata sandi)
const FIELD_AMAN = {
  id: true,
  email: true,
  nama: true,
  peran: true,
  tier: true,
  emailTerverifikasi: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Cari pengguna berdasarkan email
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
const cariByEmail = async (email) => {
  return prisma.pengguna.findUnique({
    where: { email: email.toLowerCase() },
  });
};

/**
 * Cari pengguna berdasarkan ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
const cariById = async (id) => {
  return prisma.pengguna.findUnique({
    where: { id },
    select: FIELD_AMAN,
  });
};

/**
 * Buat pengguna baru
 * @param {Object} data - { email, kataSandi, nama }
 * @returns {Promise<Object>}
 */
const buat = async ({ email, kataSandi, nama, tokenVerifikasi }) => {
  return prisma.pengguna.create({
    data: {
      email: email.toLowerCase(),
      kataSandi,
      nama,
      tokenVerifikasi,
    },
    select: FIELD_AMAN,
  });
};

/**
 * Update pengguna
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const update = async (id, data) => {
  return prisma.pengguna.update({
    where: { id },
    data,
    select: FIELD_AMAN,
  });
};

/**
 * Verifikasi email pengguna
 * @param {string} tokenVerifikasi
 * @returns {Promise<Object|null>}
 */
const verifikasiEmail = async (tokenVerifikasi) => {
  const pengguna = await prisma.pengguna.findFirst({
    where: {
      tokenVerifikasi,
      emailTerverifikasi: false,
    },
  });

  if (!pengguna) return null;

  return prisma.pengguna.update({
    where: { id: pengguna.id },
    data: {
      emailTerverifikasi: true,
      tokenVerifikasi: null,
    },
    select: FIELD_AMAN,
  });
};

/**
 * Set token reset kata sandi
 * @param {string} email
 * @param {string} token
 * @param {Date} kedaluwarsa
 * @returns {Promise<Object|null>}
 */
const setTokenReset = async (email, token, kedaluwarsa) => {
  const pengguna = await prisma.pengguna.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!pengguna) return null;

  return prisma.pengguna.update({
    where: { id: pengguna.id },
    data: {
      tokenResetKataSandi: token,
      kedaluwarsaReset: kedaluwarsa,
    },
  });
};

/**
 * Reset kata sandi dengan token
 * @param {string} token
 * @param {string} kataSandiBaru
 * @returns {Promise<Object|null>}
 */
const resetKataSandi = async (token, kataSandiBaru) => {
  const pengguna = await prisma.pengguna.findFirst({
    where: {
      tokenResetKataSandi: token,
      kedaluwarsaReset: { gte: new Date() },
    },
  });

  if (!pengguna) return null;

  return prisma.pengguna.update({
    where: { id: pengguna.id },
    data: {
      kataSandi: kataSandiBaru,
      tokenResetKataSandi: null,
      kedaluwarsaReset: null,
    },
    select: FIELD_AMAN,
  });
};

/**
 * Tambahkan token ke blacklist
 * @param {string} token
 * @param {Date} kedaluwarsa
 * @returns {Promise<Object>}
 */
const blacklistToken = async (token, kedaluwarsa) => {
  return prisma.tokenBlacklist.create({
    data: {
      token,
      kedaluwarsa,
    },
  });
};

/**
 * Cek apakah token ada di blacklist
 * @param {string} token
 * @returns {Promise<boolean>}
 */
const isTokenDiblokir = async (token) => {
  const tokenDiblokir = await prisma.tokenBlacklist.findUnique({
    where: { token },
  });
  return !!tokenDiblokir;
};

module.exports = {
  cariByEmail,
  cariById,
  buat,
  update,
  verifikasiEmail,
  setTokenReset,
  resetKataSandi,
  blacklistToken,
  isTokenDiblokir,
  FIELD_AMAN,
};
