const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_AGE_MS = 5 * 60 * 1000; // 5 menit

function bersihkanFileLama() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    return;
  }

  const sekarang = Date.now();
  let fileDihapus = 0;

  const files = fs.readdirSync(UPLOAD_DIR);

  for (const file of files) {
    if (file === '.gitkeep') continue;

    const filePath = path.join(UPLOAD_DIR, file);
    const stats = fs.statSync(filePath);

    const usiaMs = sekarang - stats.mtimeMs;

    if (usiaMs > MAX_AGE_MS) {
      try {
        fs.unlinkSync(filePath);
        fileDihapus++;
      } catch (error) {
        console.error(`Gagal hapus file ${file}:`, error.message);
      }
    }
  }

  if (fileDihapus > 0) {
    console.log(`🧹 Cleanup: ${fileDihapus} file lama dihapus`);
  }
}

function mulaiCleanupScheduler() {
  bersihkanFileLama();

  setInterval(bersihkanFileLama, 60 * 1000);
}

module.exports = {
  bersihkanFileLama,
  mulaiCleanupScheduler,
};
