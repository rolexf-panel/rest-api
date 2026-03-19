const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash kata sandi menggunakan bcrypt
 * @param {string} kataSandi - Kata sandi plain text
 * @returns {Promise<string>} - Kata sandi yang sudah di-hash
 */
const hashKataSandi = async (kataSandi) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(kataSandi, salt);
};

/**
 * Verifikasi kata sandi dengan hash
 * @param {string} kataSandi - Kata sandi plain text
 * @param {string} hash - Hash yang tersimpan
 * @returns {Promise<boolean>} - True jika cocok
 */
const verifikasiKataSandi = async (kataSandi, hash) => {
  return bcrypt.compare(kataSandi, hash);
};

module.exports = {
  hashKataSandi,
  verifikasiKataSandi,
};
