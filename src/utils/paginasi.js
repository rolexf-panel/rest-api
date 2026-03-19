/**
 * Helper untuk ekstrak parameter paginasi dari query string
 */

const BATAS_DEFAULT = 10;
const HALAMAN_DEFAULT = 1;
const BATAS_MAKSIMAL = 100;

/**
 * Ekstrak dan validasi parameter paginasi
 * @param {Object} query - Express req.query object
 * @returns {Object} - { halaman, batas, skip }
 */
const ekstrakPaginasi = (query) => {
  let halaman = parseInt(query.halaman, 10) || HALAMAN_DEFAULT;
  let batas = parseInt(query.batas, 10) || BATAS_DEFAULT;

  // Validasi nilai
  halaman = Math.max(1, halaman);
  batas = Math.min(Math.max(1, batas), BATAS_MAKSIMAL);

  const skip = (halaman - 1) * batas;

  return { halaman, batas, skip };
};

/**
 * Buat metadata paginasi untuk respons
 * @param {number} halaman - Halaman saat ini
 * @param {number} batas - Jumlah item per halaman
 * @param {number} total - Total jumlah item
 * @returns {Object} - Metadata paginasi
 */
const buatMetaPaginasi = (halaman, batas, total) => {
  const totalHalaman = Math.ceil(total / batas);

  return {
    halaman,
    batas,
    total,
    totalHalaman,
    adaHalamanBerikutnya: halaman < totalHalaman,
    adaHalamanSebelumnya: halaman > 1,
  };
};

module.exports = {
  ekstrakPaginasi,
  buatMetaPaginasi,
  BATAS_DEFAULT,
  HALAMAN_DEFAULT,
  BATAS_MAKSIMAL,
};
