# AGENTS.md

> Dokumen ini adalah panduan wajib bagi semua agent yang bekerja di proyek ini.
> **Semua respons, komentar kode, pesan commit, dan komunikasi dari agent harus menggunakan Bahasa Indonesia.**

---

## 🌐 Gambaran Proyek

Proyek ini adalah sebuah **REST API** yang dibangun dengan prinsip-prinsip rekayasa perangkat lunak modern. Agent bertugas untuk mengembangkan, memelihara, dan mendokumentasikan API ini sesuai dengan konvensi yang telah ditetapkan dalam dokumen ini.

---

## 🗣️ Bahasa Komunikasi

**WAJIB: Semua agent harus berkomunikasi dalam Bahasa Indonesia.**

Ini mencakup:
- Seluruh respons dan penjelasan kepada pengguna
- Komentar dalam kode (`// komentar`, `# komentar`, `/** komentar */`)
- Pesan commit Git
- Dokumentasi teknis yang dibuat oleh agent
- Pesan error yang ditampilkan ke pengguna (user-facing messages)
- Catatan `TODO`, `FIXME`, dan `NOTE` dalam kode

> ❌ `// Check if user exists` → ✅ `// Periksa apakah pengguna sudah ada`
> ❌ `feat: add auth middleware` → ✅ `feat: tambahkan middleware autentikasi`

---

## 🏗️ Struktur Proyek (Universal)

Meskipun teknologi dapat berbeda-beda, setiap proyek **wajib** mengikuti struktur direktori berikut:

```
project-root/
├── src/
│   ├── config/          # Konfigurasi aplikasi & environment
│   ├── controllers/     # Penanganan request dan response HTTP
│   ├── middlewares/     # Middleware (auth, validasi, error handling)
│   ├── models/          # Definisi model & skema database
│   ├── routes/          # Definisi endpoint API
│   ├── services/        # Logika bisnis aplikasi
│   ├── utils/           # Fungsi pembantu & utilitas umum
│   └── app.*            # Entry point aplikasi
├── tests/
│   ├── unit/            # Unit test per komponen
│   └── integration/     # Integration test per endpoint
├── docs/                # Dokumentasi API (OpenAPI/Swagger/Postman)
├── .env.example         # Contoh variabel environment
└── README.md            # Dokumentasi proyek
```

---

## 🏛️ Arsitektur Aplikasi

### Alur Request (Wajib Diikuti)

```
Request
  └─► Router
        └─► Middleware (auth, validasi)
              └─► Controller
                    └─► Service (logika bisnis)
                          └─► Model / Database
                                └─► Response
```

### Tanggung Jawab Setiap Layer

| Layer          | Tanggung Jawab                                              | Larangan                                      |
|----------------|-------------------------------------------------------------|-----------------------------------------------|
| **Route**      | Mendefinisikan endpoint, menghubungkan middleware & controller | Tidak boleh ada logika bisnis                |
| **Middleware** | Validasi, autentikasi, logging, error handling              | Tidak boleh memanggil DB secara langsung      |
| **Controller** | Menerima request, memanggil service, mengembalikan response | Tidak boleh ada logika bisnis atau query DB   |
| **Service**    | Semua logika bisnis                                         | Tidak boleh ada konteks HTTP (req, res)       |
| **Model**      | Definisi struktur data dan query database                   | Tidak boleh ada logika bisnis                 |

---

## 🌍 Desain API

### Konvensi URL

- Gunakan **huruf kecil** dan **tanda hubung** (`kebab-case`): `/api/v1/user-profiles`
- Selalu sertakan **versi API**: `/api/v1/...`
- Gunakan **kata benda jamak** untuk resource: `/users`, `/products`, `/orders`
- Resource bersarang: `/users/:userId/orders/:orderId`

### Metode HTTP

| Aksi                   | Metode   | Contoh Endpoint               |
|------------------------|----------|-------------------------------|
| Ambil semua data       | `GET`    | `/api/v1/resources`           |
| Ambil satu data        | `GET`    | `/api/v1/resources/:id`       |
| Buat data baru         | `POST`   | `/api/v1/resources`           |
| Perbarui seluruh data  | `PUT`    | `/api/v1/resources/:id`       |
| Perbarui sebagian data | `PATCH`  | `/api/v1/resources/:id`       |
| Hapus data             | `DELETE` | `/api/v1/resources/:id`       |

### Format Respons (Wajib Seragam)

Semua endpoint **harus** mengembalikan respons dalam format berikut:

**Berhasil:**
```json
{
  "berhasil": true,
  "pesan": "Data berhasil diambil",
  "data": { },
  "meta": {
    "halaman": 1,
    "batas": 10,
    "total": 100
  }
}
```

**Gagal / Error:**
```json
{
  "berhasil": false,
  "pesan": "Validasi gagal",
  "errors": [
    { "field": "email", "pesan": "Format email tidak valid" }
  ]
}
```

### Kode Status HTTP

| Kondisi                         | Kode  |
|---------------------------------|-------|
| Berhasil (baca data)            | `200` |
| Berhasil dibuat                 | `201` |
| Berhasil (tanpa konten)         | `204` |
| Permintaan tidak valid          | `400` |
| Tidak terautentikasi            | `401` |
| Tidak diizinkan                 | `403` |
| Data tidak ditemukan            | `404` |
| Konflik data (duplikat)         | `409` |
| Kesalahan server                | `500` |

---

## 🔐 Autentikasi & Otorisasi

- Gunakan mekanisme autentikasi berbasis **token** (JWT, API Key, OAuth — sesuai kebutuhan proyek)
- Setiap route yang dilindungi **wajib** melewati middleware autentikasi
- Terapkan kontrol akses berbasis peran (role-based access control / RBAC) bila diperlukan
- **Jangan pernah** menyimpan kata sandi dalam bentuk teks biasa — selalu gunakan hashing (bcrypt, argon2, atau sejenisnya)
- Token/kunci rahasia **tidak boleh** ditulis langsung di kode (hardcoded)

---

## 🔧 Variabel Environment

Semua konfigurasi sensitif **wajib** disimpan di file `.env`.

```env
# Konfigurasi Aplikasi
PORT=3000
APP_ENV=development

# Database
DATABASE_URL=

# Autentikasi
AUTH_SECRET=
AUTH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

- Selalu sediakan file `.env.example` dengan nilai placeholder
- File `.env` **tidak boleh** di-commit ke version control
- Tambahkan `.env` ke `.gitignore`

---

## ✅ Validasi Data

- **Semua** data masuk (body, params, query string) wajib divalidasi
- Validasi dilakukan di level middleware, **sebelum** menyentuh controller
- Kembalikan kode **400** beserta detail error per field jika validasi gagal
- Gunakan library validasi yang sesuai dengan bahasa/framework yang dipakai

---

## ⚠️ Penanganan Error

- Gunakan **satu titik penanganan error terpusat** (centralized error handler)
- Semua fungsi async harus dibungkus dengan `try/catch` atau mekanisme setara
- **Jangan pernah** mengekspos stack trace atau pesan error internal di lingkungan produksi
- Catat semua error dengan konteks yang cukup: waktu, route, dan ID pengguna (jika tersedia)

---

## 🗄️ Konvensi Database

- Gunakan **migrasi** untuk setiap perubahan skema — jangan ubah database secara langsung
- Nama tabel: `snake_case`, jamak (contoh: `user_profiles`, `order_items`)
- Nama kolom: `snake_case`
- Setiap tabel wajib memiliki: `id`, `created_at`, `updated_at`
- Gunakan **soft delete** (`deleted_at`) untuk data penting, bukan hard delete

---

## 💅 Gaya Kode

Terlepas dari bahasa pemrograman yang digunakan, ikuti aturan umum berikut:

- **Konsistensi** — ikuti pola yang sudah ada di sekitar kode yang kamu tulis
- **Satu tanggung jawab per file** — jangan campur concern yang berbeda
- **Penamaan deskriptif** — nama variabel/fungsi harus mencerminkan tujuannya
- Gunakan formatter dan linter yang sesuai dengan teknologi proyek
- Jalankan linter sebelum setiap commit

### Konvensi Penamaan Umum

| Jenis          | Konvensi           | Contoh                    |
|----------------|--------------------|---------------------------|
| Variabel       | `camelCase`        | `namaLengkap`             |
| Fungsi         | `camelCase`        | `ambilDataPengguna()`     |
| Kelas / Tipe   | `PascalCase`       | `LayananPengguna`         |
| Konstanta      | `UPPER_SNAKE_CASE` | `BATAS_PERMINTAAN`        |
| File           | `kebab-case`       | `auth-service.ts`         |
| Tabel DB       | `snake_case`       | `profil_pengguna`         |

---

## 🧪 Pengujian

- Tulis **unit test** untuk setiap fungsi di layer service
- Tulis **integration test** untuk setiap endpoint API
- Target minimum coverage: **80%**
- Test harus **terisolasi** — gunakan mock untuk ketergantungan eksternal
- Jalankan seluruh test sebelum melakukan push

### Konvensi Penamaan Test

```
describe('LayananPengguna', () => {
  it('harus membuat pengguna baru ketika data valid diberikan', ...)
  it('harus mengembalikan error ketika email sudah terdaftar', ...)
})
```

---

## 📝 Git & Alur Kerja

### Penamaan Branch

```
fitur/tambah-autentikasi-pengguna
perbaikan/selesaikan-bug-token-kedaluwarsa
refactor/pisahkan-logika-email-ke-service
chore/perbarui-dependensi
```

### Format Pesan Commit (Conventional Commits — dalam Bahasa Indonesia)

```
feat: tambahkan endpoint registrasi pengguna
fix: tangani nilai null pada pembaruan profil
refactor: pindahkan logika email ke service layer
test: tambahkan unit test untuk layanan autentikasi
docs: perbarui dokumentasi API
chore: tingkatkan versi dependensi utama
```

### Aturan Pull Request

- Setiap PR wajib menyertakan deskripsi perubahan dalam Bahasa Indonesia
- Semua test harus lulus sebelum merge
- Minimal 1 persetujuan code review sebelum merge
- Tidak ada push langsung ke branch `main` atau `develop`

---

## 📖 Dokumentasi

- Setiap endpoint baru **wajib** didokumentasikan (OpenAPI/Swagger, Postman Collection, atau format lain yang disepakati tim)
- Dokumentasi harus diperbarui dalam PR yang sama dengan perubahan endpoint
- Sertakan: deskripsi endpoint, parameter, contoh request, dan contoh response

---

## 🤖 Panduan Perilaku Agent

Ketika bekerja di codebase ini, agent **wajib**:

1. **Baca sebelum menulis** — periksa struktur dan pola kode yang sudah ada sebelum menambahkan file baru
2. **Ikuti pola yang ada** — sesuaikan gaya dan arsitektur dengan kode di sekitarnya
3. **Jangan pecah test yang ada** — jalankan suite test setelah setiap perubahan signifikan
4. **Perbarui dokumentasi** — jika menambah atau mengubah endpoint, perbarui dokumentasi API
5. **Utamakan keamanan** — jangan log data sensitif, selalu validasi input, selalu periksa autentikasi
6. **Tandai asumsi** — jika ada kebutuhan yang ambigu, implementasikan interpretasi paling aman dan tambahkan komentar `// TODO: konfirmasi kebutuhan ini`
7. **Komunikasikan dalam Bahasa Indonesia** — semua respons, komentar, dan dokumentasi harus dalam Bahasa Indonesia

---

> **Terakhir diperbarui**: Maret 2026
> Dokumen ini dikelola oleh tim proyek. Semua agent wajib mematuhi panduan ini.
