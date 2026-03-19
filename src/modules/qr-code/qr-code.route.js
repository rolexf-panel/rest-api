const { Router } = require('express');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

router.post('/generate', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const { teks, format, ukuran, warna } = req.body;

    if (!teks) {
      return res.status(400).json({
        berhasil: false,
        pesan: 'Parameter "teks" wajib diisi',
      });
    }

    const formatOutput = (format || 'png').toLowerCase();
    const validFormats = ['png', 'svg', 'dataurl'];

    if (!validFormats.includes(formatOutput)) {
      return res.status(400).json({
        berhasil: false,
        pesan: `Format tidak valid. Pilihan: ${validFormats.join(', ')}`,
      });
    }

    const options = {
      width: ukuran || 300,
      margin: 2,
      color: {
        dark: warna || '#000000',
        light: '#ffffff',
      },
    };

    let url;
    let dataUrl;
    let namaFile;

    switch (formatOutput) {
      case 'png':
        const buffer = await QRCode.toBuffer(teks, { ...options, type: 'png' });
        namaFile = `qr_${crypto.randomBytes(4).toString('hex')}.png`;
        const outputPath = path.join(process.cwd(), 'uploads', namaFile);

        if (!fs.existsSync(path.dirname(outputPath))) {
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        }
        fs.writeFileSync(outputPath, buffer);
        url = `/uploads/${namaFile}`;
        break;

      case 'svg':
        const svgString = await QRCode.toString(teks, { ...options, type: 'svg' });
        namaFile = `qr_${crypto.randomBytes(4).toString('hex')}.svg`;
        const svgPath = path.join(process.cwd(), 'uploads', namaFile);

        if (!fs.existsSync(path.dirname(svgPath))) {
          fs.mkdirSync(path.dirname(svgPath), { recursive: true });
        }
        fs.writeFileSync(svgPath, svgString);
        url = `/uploads/${namaFile}`;
        break;

      case 'dataurl':
      default:
        dataUrl = await QRCode.toDataURL(teks, options);
        break;
    }

    return responsBerhasil(res, {
      pesan: 'QR Code berhasil dibuat',
      data: {
        teks,
        format: formatOutput,
        url: url || null,
        dataUrl: dataUrl || null,
        width: options.width,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
