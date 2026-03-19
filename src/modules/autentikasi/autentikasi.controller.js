const service = require('./autentikasi.service');
const { responsBerhasil, responsDibuat } = require('../../utils/respons');

/**
 * Controller autentikasi
 * Menangani request dan response HTTP
 * Tidak ada logika bisnis di sini — semua delegasi ke service
 */

/**
 * POST /api/v1/auth/register
 * Registrasi pengguna baru
 */
const register = async (req, res, next) => {
  try {
    const { email, kataSandi, nama } = req.body;
    const hasil = await service.register({ email, kataSandi, nama });

    return responsDibuat(
      res,
      'Registrasi berhasil. Silakan verifikasi akun Anda melalui link Telegram.',
      hasil,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Login dan dapatkan token
 */
const login = async (req, res, next) => {
  try {
    const { email, kataSandi } = req.body;
    const hasil = await service.login({ email, kataSandi });

    return responsBerhasil(res, {
      pesan: 'Login berhasil',
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Logout (revoke token)
 */
const logout = async (req, res, next) => {
  try {
    // Ambil token dari header
    const token = req.headers.authorization.split(' ')[1];
    await service.logout(token);

    return responsBerhasil(res, {
      pesan: 'Logout berhasil',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/refresh-token
 * Perpanjang access token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const hasil = await service.refreshToken(token);

    return responsBerhasil(res, {
      pesan: 'Token berhasil diperbarui',
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/profil
 * Ambil profil pengguna yang sedang login
 */
const getProfil = async (req, res, next) => {
  try {
    const hasil = await service.getProfil(req.user.id);

    return responsBerhasil(res, {
      pesan: 'Profil berhasil diambil',
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/auth/profil
 * Update profil pengguna
 */
const updateProfil = async (req, res, next) => {
  try {
    const hasil = await service.updateProfil(req.user.id, req.body);

    return responsBerhasil(res, {
      pesan: 'Profil berhasil diperbarui',
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/lupa-kata-sandi
 * Minta link reset kata sandi
 */
const lupaKataSandi = async (req, res, next) => {
  try {
    const { email } = req.body;
    const hasil = await service.lupaKataSandi(email);

    return responsBerhasil(res, {
      pesan: hasil.pesan,
      data: hasil.debug_token
        ? {
            // Debug info — hapus di production
            token: hasil.debug_token,
            kedaluwarsa: hasil.debug_kedaluwarsa,
          }
        : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/reset-kata-sandi
 * Reset kata sandi dengan token
 */
const resetKataSandi = async (req, res, next) => {
  try {
    const { token, kataSandiBaru } = req.body;
    await service.resetKataSandi(token, kataSandiBaru);

    return responsBerhasil(res, {
      pesan: 'Kata sandi berhasil diubah',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/verifikasi/:kode
 * Verifikasi email dengan kode dari Telegram
 */
const verifikasiEmail = async (req, res, next) => {
  try {
    const { kode } = req.params;
    const hasil = await service.verifikasiEmail(kode);

    return responsBerhasil(res, {
      pesan: 'Email berhasil diverifikasi',
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
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
};
