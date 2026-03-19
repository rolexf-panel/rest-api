const TelegramBot = require('node-telegram-bot-api');
const prisma = require('../../config/prisma');
const konfigurasi = require('../../config');
const logger = require('../../middlewares/logger');

/**
 * Bot Telegram untuk verifikasi akun
 *
 * Flow:
 * 1. User register → dapat link: https://t.me/botname?start=VERIF_XXXX
 * 2. User klik link → kirim /start VERIF_XXXX ke bot
 * 3. Bot kirim captcha tombol
 * 4. User klik tombol benar → akun terverifikasi
 * 5. Bot kirim konfirmasi sukses
 */

let bot = null;

// Penyimpanan sementara untuk sesi captcha
// Key: chatId:kode, Value: { kodeVerifikasi, jawabanBenar, attempts }
const sesiCaptcha = new Map();

/**
 * Generate captcha tombol
 * Membuat 3 tombol dengan 1 jawaban benar (hijau)
 */
const generateCaptcha = () => {
  const warna = ['🟢', '🔴', '🔵'];
  const acak = warna.sort(() => Math.random() - 0.5);
  const jawabanBenar = acak.indexOf('🟢');

  return {
    tombol: acak.map((emoji, index) => ({
      text: emoji,
      callback_data: `captcha_${index}`,
    })),
    jawabanBenar,
  };
};

/**
 * Handle command /start dengan kode verifikasi
 * Format: /start VERIF_XXXX
 */
const handleStart = async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const parts = text.split(' ');
  const kodeVerifikasi = parts[1];

  // Jika tidak ada kode verifikasi
  if (!kodeVerifikasi) {
    await bot.sendMessage(
      chatId,
      `👋 *Selamat Datang di REST API Verifikasi Bot!*\n\n` +
        `Bot ini digunakan untuk memverifikasi akun REST API Anda.\n\n` +
        `📋 *Cara Verifikasi:*\n` +
        `1. Daftar akun di REST API\n` +
        `2. Klik link verifikasi yang diberikan\n` +
        `3. Bot akan mengirim captcha\n` +
        `4. Klik tombol yang benar untuk verifikasi\n\n` +
        `🔗 Link verifikasi akan diberikan setelah Anda mendaftar.`,
      { parse_mode: 'Markdown' },
    );
    return;
  }

  // Cari pengguna dengan kode verifikasi ini
  const pengguna = await prisma.pengguna.findFirst({
    where: {
      tokenVerifikasi: kodeVerifikasi,
      emailTerverifikasi: false,
    },
  });

  if (!pengguna) {
    await bot.sendMessage(
      chatId,
      `❌ *Kode Verifikasi Tidak Valid*\n\n` +
        `Kode \`${kodeVerifikasi}\` tidak ditemukan atau sudah digunakan.\n\n` +
        `Silakan minta link verifikasi baru melalui dashboard.`,
      { parse_mode: 'Markdown' },
    );
    return;
  }

  // Cek kedaluwarsa (24 jam dari createdAt)
  const kedaluwarsa = new Date(pengguna.createdAt.getTime() + 24 * 60 * 60 * 1000);
  if (new Date() > kedaluwarsa) {
    await bot.sendMessage(
      chatId,
      `⏰ *Kode Verifikasi Kedaluwarsa*\n\n` +
        `Kode \`${kodeVerifikasi}\` sudah kedaluwarsa (berlaku 24 jam).\n\n` +
        `Silakan daftar ulang untuk mendapatkan kode baru.`,
      { parse_mode: 'Markdown' },
    );
    return;
  }

  // Generate captcha
  const captcha = generateCaptcha();

  // Simpan sesi captcha
  sesiCaptcha.set(`${chatId}:${kodeVerifikasi}`, {
    kodeVerifikasi,
    jawabanBenar: captcha.jawabanBenar,
    attempts: 0,
    penggunaId: pengguna.id,
  });

  // Kirim pesan dengan tombol captcha
  await bot.sendMessage(
    chatId,
    `🔐 *Verifikasi Akun*\n\n` +
      `Akun: ${pengguna.email}\n\n` +
      `Untuk memverifikasi akun Anda, klik tombol 🟢 *hijau* di bawah ini.\n\n` +
      `_Pilih dengan benar untuk menyelesaikan verifikasi._`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [captcha.tombol],
      },
    },
  );
};

/**
 * Handle callback dari tombol captcha
 */
const handleCaptchaCallback = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  // Ekstrak index tombol yang diklik
  const tombolIndex = parseInt(data.split('_')[1]);

  // Cari sesi captcha yang aktif
  let sesiAktif = null;
  let sesiKey = null;

  for (const [key, value] of sesiCaptcha.entries()) {
    if (key.startsWith(`${chatId}:`)) {
      sesiAktif = value;
      sesiKey = key;
      break;
    }
  }

  if (!sesiAktif) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Sesi captcha sudah kedaluwarsa. Silakan mulai ulang.',
      show_alert: true,
    });
    return;
  }

  // Cek jawaban
  if (tombolIndex === sesiAktif.jawabanBenar) {
    // JAWABAN BENAR - Verifikasi berhasil!
    try {
      await prisma.pengguna.update({
        where: { id: sesiAktif.penggunaId },
        data: {
          emailTerverifikasi: true,
          tokenVerifikasi: null,
        },
      });

      // Hapus sesi
      sesiCaptcha.delete(sesiKey);

      // Update pesan captcha
      await bot.editMessageText(
        `✅ *Verifikasi Berhasil!*\n\n` +
          `Akun Anda telah berhasil diverifikasi.\n\n` +
          `Anda sekarang dapat login ke REST API dan menggunakan semua fitur.`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Buka Dashboard',
                  url: konfigurasi.appUrl || 'http://localhost:5173',
                },
              ],
            ],
          },
        },
      );

      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '✅ Verifikasi berhasil!',
      });

      logger.info(`Verifikasi berhasil untuk user ${sesiAktif.penggunaId}`);
    } catch (error) {
      logger.error('Error saat verifikasi:', error);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: 'Terjadi kesalahan. Silakan coba lagi.',
        show_alert: true,
      });
    }
  } else {
    // JAWABAN SALAH
    sesiAktif.attempts += 1;

    if (sesiAktif.attempts >= 3) {
      // Terlalu banyak salah - hapus sesi
      sesiCaptcha.delete(sesiKey);

      await bot.editMessageText(
        `❌ *Verifikasi Gagal*\n\n` +
          `Anda telah salah menjawab 3 kali.\n\n` +
          `Silakan mulai ulang verifikasi dengan mengklik link yang sama.`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
        },
      );

      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ Verifikasi gagal. Silakan mulai ulang.',
        show_alert: true,
      });
    } else {
      // Masih ada kesempatan
      const sisa = 3 - sesiAktif.attempts;

      // Generate captcha baru
      const captchaBaru = generateCaptcha();
      sesiAktif.jawabanBenar = captchaBaru.jawabanBenar;

      await bot.editMessageText(
        `❌ *Jawaban Salah!*\n\n` +
          `Anda memiliki ${sisa} kesempatan lagi.\n\n` +
          `Klik tombol 🟢 *hijau* untuk verifikasi:`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [captchaBaru.tombol],
          },
        },
      );

      await bot.answerCallbackQuery(callbackQuery.id, {
        text: `❌ Salah! ${sisa} kesempatan tersisa.`,
        show_alert: true,
      });
    }
  }
};

/**
 * Handle /help command
 */
const handleHelp = async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `📖 *Bantuan REST API Verifikasi Bot*\n\n` +
      `*Perintah yang tersedia:*\n` +
      `/start [kode] - Mulai verifikasi dengan kode\n` +
      `/help - Tampilkan bantuan ini\n\n` +
      `*Cara Verifikasi:*\n` +
      `1. Daftar akun di REST API\n` +
      `2. Anda akan mendapat link verifikasi\n` +
      `3. Klik link tersebut untuk membuka bot\n` +
      `4. Ikuti instruksi captcha yang diberikan\n` +
      `5. Klik tombol yang benar untuk verifikasi\n\n` +
      `*Masalah?*\n` +
      `Jika kode verifikasi tidak berfungsi, silakan daftar ulang untuk mendapatkan kode baru.`,
    { parse_mode: 'Markdown' },
  );
};

/**
 * Inisialisasi bot Telegram
 * @returns {TelegramBot|null} Instance bot atau null jika token tidak ada
 */
const inisialisasiBot = () => {
  const token = konfigurasi.external?.telegramBotToken;

  if (!token) {
    logger.warn('⚠️ TELEGRAM_BOT_TOKEN tidak dikonfigurasi. Bot Telegram tidak aktif.');
    return null;
  }

  try {
    bot = new TelegramBot(token, { polling: true });

    // Register handlers
    bot.onText(/\/start(.*)/, handleStart);
    bot.onText(/\/help/, handleHelp);
    bot.on('callback_query', handleCaptchaCallback);

    // Handle polling errors
    bot.on('polling_error', (error) => {
      logger.error('Telegram polling error:', error.message);
    });

    logger.info('🤖 Bot Telegram berhasil diinisialisasi');
    return bot;
  } catch (error) {
    logger.error('❌ Gagal menginisialisasi bot Telegram:', error.message);
    return null;
  }
};

/**
 * Matikan bot Telegram
 */
const matikanBot = async () => {
  if (bot) {
    await bot.stopPolling();
    bot = null;
    logger.info('🔴 Bot Telegram dimatikan');
  }
};

module.exports = {
  inisialisasiBot,
  matikanBot,
};
