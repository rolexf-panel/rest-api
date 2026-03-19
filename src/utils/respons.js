/**
 * Helper untuk format respons API yang seragam
 * Mengikuti konvensi AGENTS.md: berhasil, pesan, data, meta, errors
 */

/**
 * Respons berhasil dengan data
 * @param {Object} res - Express response object
 * @param {Object} options - Opsi respons
 * @param {string} options.pesan - Pesan sukses
 * @param {*} options.data - Data yang dikembalikan
 * @param {Object} options.meta - Metadata paginasi
 * @param {number} options.statusCode - HTTP status code (default: 200)
 */
const responsBerhasil = (
  res,
  { pesan = 'Berhasil', data = null, meta = null, statusCode = 200 } = {},
) => {
  const respons = {
    berhasil: true,
    pesan,
  };

  if (data !== null) {
    respons.data = data;
  }

  if (meta !== null) {
    respons.meta = meta;
  }

  return res.status(statusCode).json(respons);
};

/**
 * Respons berhasil tanpa konten (204)
 * @param {Object} res - Express response object
 */
const responsTidakAdaKonten = (res) => {
  return res.status(204).send();
};

/**
 * Respons berhasil saat membuat resource baru (201)
 * @param {Object} res - Express response object
 * @param {string} pesan - Pesan sukses
 * @param {*} data - Data resource yang dibuat
 */
const responsDibuat = (res, pesan = 'Data berhasil dibuat', data = null) => {
  return responsBerhasil(res, { pesan, data, statusCode: 201 });
};

/**
 * Respons gagal/error
 * @param {Object} res - Express response object
 * @param {Object} options - Opsi respons error
 * @param {string} options.pesan - Pesan error utama
 * @param {Array} options.errors - Detail error per field
 * @param {number} options.statusCode - HTTP status code (default: 400)
 */
const responsGagal = (
  res,
  { pesan = 'Terjadi kesalahan', errors = null, statusCode = 400 } = {},
) => {
  const respons = {
    berhasil: false,
    pesan,
  };

  if (errors !== null) {
    respons.errors = errors;
  }

  return res.status(statusCode).json(respons);
};

/**
 * Respons error validasi (400)
 * @param {Object} res - Express response object
 * @param {Array} errors - Array error validasi
 */
const responsValidasiGagal = (res, errors) => {
  return responsGagal(res, {
    pesan: 'Validasi gagal',
    errors,
    statusCode: 400,
  });
};

/**
 * Respons tidak terautentikasi (401)
 * @param {Object} res - Express response object
 * @param {string} pesan - Pesan error
 */
const responsTidakTerautentikasi = (res, pesan = 'Tidak terautentikasi') => {
  return responsGagal(res, { pesan, statusCode: 401 });
};

/**
 * Respons tidak diizinkan (403)
 * @param {Object} res - Express response object
 * @param {string} pesan - Pesan error
 */
const responsTidakDiizinkan = (res, pesan = 'Tidak diizinkan') => {
  return responsGagal(res, { pesan, statusCode: 403 });
};

/**
 * Respons data tidak ditemukan (404)
 * @param {Object} res - Express response object
 * @param {string} pesan - Pesan error
 */
const responsTidakDitemukan = (res, pesan = 'Data tidak ditemukan') => {
  return responsGagal(res, { pesan, statusCode: 404 });
};

/**
 * Respons konflik data (409)
 * @param {Object} res - Express response object
 * @param {string} pesan - Pesan error
 */
const responsKonflik = (res, pesan = 'Data sudah ada') => {
  return responsGagal(res, { pesan, statusCode: 409 });
};

/**
 * Respons error server (500)
 * @param {Object} res - Express response object
 * @param {string} pesan - Pesan error
 */
const responsErrorServer = (res, pesan = 'Terjadi kesalahan pada server') => {
  return responsGagal(res, { pesan, statusCode: 500 });
};

module.exports = {
  responsBerhasil,
  responsTidakAdaKonten,
  responsDibuat,
  responsGagal,
  responsValidasiGagal,
  responsTidakTerautentikasi,
  responsTidakDiizinkan,
  responsTidakDitemukan,
  responsKonflik,
  responsErrorServer,
};
