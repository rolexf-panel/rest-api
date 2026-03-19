const { ValidationError } = require('../utils/error-kustom');

/**
 * Factory middleware untuk validasi request menggunakan Zod
 * @param {import('zod').ZodSchema} schema - Schema Zod untuk validasi
 * @param {'body' | 'params' | 'query'} sumber - Sumber data yang akan divalidasi
 */
const validasi = (schema, sumber = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[sumber];
      const hasil = schema.safeParse(data);

      if (!hasil.success) {
        const errors = hasil.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          pesan: issue.message,
        }));

        throw new ValidationError(errors);
      }

      // Ganti data request dengan data yang sudah divalidasi & di-transform
      req[sumber] = hasil.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validasi;
