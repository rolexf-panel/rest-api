const { Router } = require('express');
const controller = require('./autentikasi.controller');
const validasi = require('../../middlewares/validasi');
const { autentikasi } = require('../../middlewares/autentikasi');
const { rateLimitAuth } = require('../../middlewares/rate-limit');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  lupaKataSandiSchema,
  resetKataSandiSchema,
  updateProfilSchema,
} = require('./autentikasi.validasi');

const router = Router();

/**
 * Route autentikasi
 * Semua endpoint terkait autentikasi ada di sini
 */

// POST /api/v1/auth/register
// Registrasi pengguna baru
router.post('/register', rateLimitAuth, validasi(registerSchema), controller.register);

// POST /api/v1/auth/login
// Login dan dapatkan token
router.post('/login', rateLimitAuth, validasi(loginSchema), controller.login);

// POST /api/v1/auth/logout
// Logout (revoke token) — memerlukan autentikasi
router.post('/logout', autentikasi, controller.logout);

// POST /api/v1/auth/refresh-token
// Perpanjang access token
router.post('/refresh-token', validasi(refreshTokenSchema), controller.refreshToken);

// GET /api/v1/auth/profil
// Ambil profil pengguna — memerlukan autentikasi
router.get('/profil', autentikasi, controller.getProfil);

// PATCH /api/v1/auth/profil
// Update profil pengguna — memerlukan autentikasi
router.patch('/profil', autentikasi, validasi(updateProfilSchema), controller.updateProfil);

// POST /api/v1/auth/lupa-kata-sandi
// Minta link reset kata sandi
router.post(
  '/lupa-kata-sandi',
  rateLimitAuth,
  validasi(lupaKataSandiSchema),
  controller.lupaKataSandi,
);

// POST /api/v1/auth/reset-kata-sandi
// Reset kata sandi dengan token
router.post(
  '/reset-kata-sandi',
  rateLimitAuth,
  validasi(resetKataSandiSchema),
  controller.resetKataSandi,
);

// GET /api/v1/auth/verifikasi/:kode
// Verifikasi email dengan kode dari Telegram
router.get('/verifikasi/:kode', controller.verifikasiEmail);

module.exports = router;
