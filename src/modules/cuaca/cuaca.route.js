const { Router } = require('express');
const axios = require('axios');
const konfigurasi = require('../../config');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

/**
 * GET /api/v1/cuaca/saat-ini
 * Cuaca saat ini berdasarkan kota (butuh API key)
 */
router.get('/saat-ini', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { kota } = req.query;

    if (!kota) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "kota" wajib diisi',
      });
    }

    const apiKey = konfigurasi.external.openWeatherMap;

    // Jika tidak ada API key, return data dummy
    if (!apiKey) {
      return responsBerhasil(res, {
        pesan: 'Data cuaca (demo)',
        data: {
          kota,
          suhu: 28,
          deskripsi: 'Cerah berawan',
          kelembapan: 75,
          angin: 12,
          catatan: 'Gunakan OPENWEATHERMAP_API_KEY untuk data real',
        },
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(kota)}&appid=${apiKey}&units=metric&lang=id`
    );

    return responsBerhasil(res, {
      pesan: 'Data cuaca berhasil diambil',
      data: {
        kota: response.data.name,
        negara: response.data.sys.country,
        suhu: Math.round(response.data.main.temp),
        terasa: Math.round(response.data.main.feels_like),
        kelembapan: response.data.main.humidity,
        deskripsi: response.data.weather[0].description,
        ikon: response.data.weather[0].icon,
        angin: response.data.wind.speed,
        tekanan: response.data.main.pressure,
      },
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        berhasil: false,
        pesan: 'Kota tidak ditemukan',
      });
    }
    next(error);
  }
});

/**
 * GET /api/v1/cuaca/prakiraan
 * Prakiraan cuaca 5 hari (butuh API key)
 */
router.get('/prakiraan', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { kota } = req.query;

    if (!kota) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "kota" wajib diisi',
      });
    }

    const apiKey = konfigurasi.external.openWeatherMap;

    // Jika tidak ada API key, return data dummy
    if (!apiKey) {
      return responsBerhasil(res, {
        pesan: 'Data prakiraan (demo)',
        data: {
          kota,
          prakiraan: [
            { tanggal: '2026-03-20', suhu: 29, deskripsi: 'Cerah' },
            { tanggal: '2026-03-21', suhu: 27, deskripsi: 'Berawan' },
            { tanggal: '2026-03-22', suhu: 26, deskripsi: 'Hujan ringan' },
            { tanggal: '2026-03-23', suhu: 28, deskripsi: 'Cerah' },
            { tanggal: '2026-03-24', suhu: 30, deskripsi: 'Cerah' },
          ],
          catatan: 'Gunakan OPENWEATHERMAP_API_KEY untuk data real',
        },
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(kota)}&appid=${apiKey}&units=metric&lang=id&cnt=5`
    );

    const prakiraan = response.data.list.map((item) => ({
      tanggal: item.dt_txt,
      suhu: Math.round(item.main.temp),
      deskripsi: item.weather[0].description,
      ikon: item.weather[0].icon,
      kelembapan: item.main.humidity,
    }));

    return responsBerhasil(res, {
      pesan: 'Data prakiraan berhasil diambil',
      data: {
        kota: response.data.city.name,
        negara: response.data.city.country,
        prakiraan,
      },
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        berhasil: false,
        pesan: 'Kota tidak ditemukan',
      });
    }
    next(error);
  }
});

module.exports = router;
