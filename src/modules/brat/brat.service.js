const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

async function buatBratImage(teks) {
  const sanitizedText = teks.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase() || 'BRAT';

  const width = 600;
  const height = 600;

  const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#8ace00"/>
      <rect x="8" y="8" width="${width - 16}" height="${height - 16}" fill="none" stroke="#8ace00" stroke-width="4"/>
      <text x="50%" y="55%" font-family="Arial Black, sans-serif" font-size="${sanitizedText.length > 10 ? '70' : '90'}" font-weight="900" fill="#000000" text-anchor="middle" dominant-baseline="middle">${sanitizedText}</text>
      <text x="${width - 20}" y="${height - 15}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#000000" text-anchor="end">Charli xcx</text>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svgImage)).png().toBuffer();

  const namaFile = `brat_${crypto.randomBytes(4).toString('hex')}.png`;
  const outputPath = path.join(process.cwd(), 'uploads', namaFile);

  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);

  return {
    namaFile,
    path: outputPath,
    url: `/uploads/${namaFile}`,
    width,
    height,
    format: 'png',
  };
}

async function buatBratVid(teks) {
  const sanitizedText = teks.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase() || 'BRAT';

  const width = 640;
  const height = 640;

  const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#8ace00"/>
      <rect x="8" y="8" width="${width - 16}" height="${height - 16}" fill="none" stroke="#8ace00" stroke-width="4"/>
      <text x="50%" y="55%" font-family="Arial Black, sans-serif" font-size="${sanitizedText.length > 10 ? '70' : '90'}" font-weight="900" fill="#000000" text-anchor="middle" dominant-baseline="middle">${sanitizedText}</text>
      <text x="${width - 20}" y="${height - 15}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#000000" text-anchor="end">Charli xcx</text>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svgImage)).webp({ quality: 90 }).toBuffer();

  const namaFile = `bratvid_${crypto.randomBytes(4).toString('hex')}.webp`;
  const outputPath = path.join(process.cwd(), 'uploads', namaFile);

  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);

  return {
    namaFile,
    path: outputPath,
    url: `/uploads/${namaFile}`,
    width,
    height,
    format: 'webp',
  };
}

module.exports = {
  buatBratImage,
  buatBratVid,
};
