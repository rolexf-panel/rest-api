const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const konfigurasi = require('../config');
const { AppError } = require('../utils/error-kustom');

// Konfigurasi storage untuk Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, konfigurasi.upload.dir);
  },
  filename: (req, file, cb) => {
    const ekstensi = path.extname(file.originalname);
    const namaUnik = `${uuidv4()}${ekstensi}`;
    cb(null, namaUnik);
  },
});

// Filter tipe file yang diizinkan
const fileFilter = (req, file, cb) => {
  const tipeDiizinkan = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
  ];

  if (tipeDiizinkan.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Tipe file ${file.mimetype} tidak diizinkan`, 400), false);
  }
};

// Instance Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: konfigurasi.upload.maxSize,
  },
});

module.exports = upload;
