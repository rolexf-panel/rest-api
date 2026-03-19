const { z } = require('zod/v4');

/**
 * Schema validasi untuk endpoint autentikasi
 * Menggunakan Zod untuk type-safe validation
 */

// Validasi registrasi
const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email wajib diisi' })
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
  kataSandi: z
    .string({ required_error: 'Kata sandi wajib diisi' })
    .min(8, 'Kata sandi minimal 8 karakter')
    .max(128, 'Kata sandi terlalu panjang')
    .regex(/[A-Z]/, 'Kata sandi harus mengandung huruf besar')
    .regex(/[a-z]/, 'Kata sandi harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Kata sandi harus mengandung angka'),
  nama: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang').optional(),
});

// Validasi login
const loginSchema = z.object({
  email: z.string({ required_error: 'Email wajib diisi' }).email('Format email tidak valid'),
  kataSandi: z
    .string({ required_error: 'Kata sandi wajib diisi' })
    .min(1, 'Kata sandi wajib diisi'),
});

// Validasi refresh token
const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Refresh token wajib diisi' })
    .min(1, 'Refresh token tidak boleh kosong'),
});

// Validasi lupa kata sandi
const lupaKataSandiSchema = z.object({
  email: z.string({ required_error: 'Email wajib diisi' }).email('Format email tidak valid'),
});

// Validasi reset kata sandi
const resetKataSandiSchema = z.object({
  token: z.string({ required_error: 'Token wajib diisi' }).min(1, 'Token tidak boleh kosong'),
  kataSandiBaru: z
    .string({ required_error: 'Kata sandi baru wajib diisi' })
    .min(8, 'Kata sandi minimal 8 karakter')
    .max(128, 'Kata sandi terlalu panjang')
    .regex(/[A-Z]/, 'Kata sandi harus mengandung huruf besar')
    .regex(/[a-z]/, 'Kata sandi harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Kata sandi harus mengandung angka'),
});

// Validasi update profil
const updateProfilSchema = z
  .object({
    nama: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi',
  });

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  lupaKataSandiSchema,
  resetKataSandiSchema,
  updateProfilSchema,
};
