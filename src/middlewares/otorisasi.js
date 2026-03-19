const { AuthorizationError } = require('../utils/error-kustom');

/**
 * Middleware otorisasi berbasis peran (RBAC)
 * Memastikan pengguna memiliki peran yang diizinkan
 * @param  {...string} peranDiizinkan - Daftar peran yang diizinkan mengakses
 */
const otorisasi = (...peranDiizinkan) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Anda harus login terlebih dahulu'));
    }

    if (!peranDiizinkan.includes(req.user.peran)) {
      return next(new AuthorizationError('Anda tidak memiliki izin untuk mengakses resource ini'));
    }

    next();
  };
};

/**
 * Middleware otorisasi berdasarkan tier
 * Memastikan pengguna memiliki tier yang sesuai
 * @param  {...string} tierDiizinkan - Daftar tier yang diizinkan
 */
const otorisasiTier = (...tierDiizinkan) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Anda harus login terlebih dahulu'));
    }

    if (!tierDiizinkan.includes(req.user.tier)) {
      return next(new AuthorizationError('Endpoint ini memerlukan upgrade tier'));
    }

    next();
  };
};

/**
 * Middleware: pemilik resource atau admin
 * Memastikan pengguna adalah pemilik data atau admin
 * @param {Function} getIdFromRequest - Fungsi untuk mengambil ID resource dari request
 */
const pemilikAtauAdmin = (getIdFromRequest) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Anda harus login terlebih dahulu'));
    }

    const resourceId = getIdFromRequest(req);

    if (req.user.peran === 'admin' || req.user.id === resourceId) {
      return next();
    }

    return next(new AuthorizationError('Anda tidak memiliki izin untuk mengakses resource ini'));
  };
};

module.exports = { otorisasi, otorisasiTier, pemilikAtauAdmin };
