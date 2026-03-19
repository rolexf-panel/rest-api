const { Router } = require('express');
const { autentikasiApiKey, rateLimiterMiddleware } = require('../../middlewares/api-key');
const { responsBerhasil } = require('../../utils/respons');

const router = Router();

// Kata-kata Lorem Ipsum
const kataLorem = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'perspiciatis',
  'unde',
  'omnis',
  'iste',
  'natus',
  'error',
  'voluptatem',
  'accusantium',
  'doloremque',
  'laudantium',
  'totam',
  'rem',
  'aperiam',
  'eaque',
  'ipsa',
  'quae',
  'ab',
  'illo',
  'inventore',
  'veritatis',
  'quasi',
  'architecto',
  'beatae',
  'vitae',
  'dicta',
];

/**
 * Generate kata random dari array
 */
const randomKata = () => kataLorem[Math.floor(Math.random() * kataLorem.length)];

/**
 * Generate kalimat
 */
const generateKalimat = (jumlahKata = 10) => {
  const kata = [];
  for (let i = 0; i < jumlahKata; i++) {
    kata.push(randomKata());
  }
  kata[0] = kata[0].charAt(0).toUpperCase() + kata[0].slice(1);
  return kata.join(' ') + '.';
};

/**
 * Generate paragraf
 */
const generateParagraf = (jumlahKalimat = 5) => {
  const kalimat = [];
  for (let i = 0; i < jumlahKalimat; i++) {
    kalimat.push(generateKalimat(Math.floor(Math.random() * 10) + 8));
  }
  return kalimat.join(' ');
};

/**
 * GET /api/v1/lorem/kata
 * Generate kata Lorem Ipsum (butuh API key)
 */
router.get('/kata', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const jumlah = Math.min(parseInt(req.query.jumlah) || 10, 100);
    const kata = [];
    for (let i = 0; i < jumlah; i++) {
      kata.push(randomKata());
    }

    return responsBerhasil(res, {
      pesan: 'Kata Lorem Ipsum berhasil dibuat',
      data: {
        teks: kata.join(' '),
        jumlah: kata.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/lorem/kalimat
 * Generate kalimat Lorem Ipsum (butuh API key)
 */
router.get('/kalimat', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const jumlah = Math.min(parseInt(req.query.jumlah) || 3, 20);
    const kalimat = [];
    for (let i = 0; i < jumlah; i++) {
      kalimat.push(generateKalimat());
    }

    return responsBerhasil(res, {
      pesan: 'Kalimat Lorem Ipsum berhasil dibuat',
      data: {
        teks: kalimat.join(' '),
        jumlah: kalimat.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/lorem/paragraf
 * Generate paragraf Lorem Ipsum (butuh API key)
 */
router.get('/paragraf', autentikasiApiKey, rateLimiterMiddleware, async (req, res, next) => {
  try {
    const jumlah = Math.min(parseInt(req.query.jumlah) || 3, 10);
    const paragraf = [];
    for (let i = 0; i < jumlah; i++) {
      paragraf.push(generateParagraf());
    }

    return responsBerhasil(res, {
      pesan: 'Paragraf Lorem Ipsum berhasil dibuat',
      data: {
        teks: paragraf.join('\n\n'),
        jumlah: paragraf.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
