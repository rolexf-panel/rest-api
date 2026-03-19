const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function buatKunciAcak() {
  return `sk_${crypto.randomBytes(32).toString('hex')}`;
}

async function buatApiKey(penggunaId, nama = 'API Key Utama') {
  const kunci = buatKunciAcak();
  const kunciPrefix = kunci.substring(0, 12);

  const apiKey = await prisma.apiKey.create({
    data: {
      nama,
      kunci,
      kunciPrefix,
      penggunaId,
    },
  });

  return apiKey;
}

async function daftarApiKey(penggunaId) {
  const keys = await prisma.apiKey.findMany({
    where: { penggunaId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nama: true,
      kunciPrefix: true,
      aktif: true,
      terakhirDigunakan: true,
      createdAt: true,
    },
  });

  return keys;
}

async function nonaktifkanApiKey(penggunaId, keyId) {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, penggunaId },
  });

  if (!key) {
    return null;
  }

  return prisma.apiKey.update({
    where: { id: keyId },
    data: { aktif: false },
  });
}

async function hapusApiKey(penggunaId, keyId) {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, penggunaId },
  });

  if (!key) {
    return null;
  }

  return prisma.apiKey.delete({
    where: { id: keyId },
  });
}

async function aktifkanApiKey(penggunaId, keyId) {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, penggunaId },
  });

  if (!key) {
    return null;
  }

  return prisma.apiKey.update({
    where: { id: keyId },
    data: { aktif: true },
  });
}

async function regenerasiApiKey(penggunaId, keyId) {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, penggunaId },
  });

  if (!key) {
    return null;
  }

  const kunciBaru = buatKunciAcak();
  const kunciPrefix = kunciBaru.substring(0, 12);

  return prisma.apiKey.update({
    where: { id: keyId },
    data: {
      kunci: kunciBaru,
      kunciPrefix,
      aktif: true,
    },
  });
}

async function daftarSemuaApiKey(limit = 100, offset = 0) {
  const [keys, total] = await Promise.all([
    prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        pengguna: {
          select: {
            id: true,
            email: true,
            nama: true,
            peran: true,
          },
        },
      },
    }),
    prisma.apiKey.count(),
  ]);

  return { keys, total };
}

async function revokeApiKey(keyId) {
  return prisma.apiKey.update({
    where: { id: keyId },
    data: { aktif: false },
  });
}

async function aktifkanKembaliApiKey(keyId) {
  return prisma.apiKey.update({
    where: { id: keyId },
    data: { aktif: true },
  });
}

async function hapusApiKeyPermanen(keyId) {
  try {
    return await prisma.apiKey.delete({
      where: { id: keyId },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

async function getApiKeyStats() {
  const [totalKeys, activeKeys, allKeys] = await Promise.all([
    prisma.apiKey.count(),
    prisma.apiKey.count({ where: { aktif: true } }),
    prisma.apiKey.findMany({
      select: {
        terakhirDigunakan: true,
        createdAt: true,
      },
    }),
  ]);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const requestsToday = allKeys.filter(
    (k) => k.terakhirDigunakan && k.terakhirDigunakan >= startOfDay
  ).length;

  const totalRequests = allKeys.filter((k) => k.terakhirDigunakan).length;

  return {
    totalKeys,
    activeKeys,
    requestsToday,
    totalRequests,
  };
}

async function getRateLimitSettings() {
  const settings = await prisma.pengaturanRateLimit.findMany({
    orderBy: { paket: 'asc' },
  });

  if (settings.length === 0) {
    return [
      { paket: 'free', nama: 'Free', limit: 100 },
      { paket: 'basic', nama: 'Basic', limit: 500 },
      { paket: 'premium', nama: 'Premium', limit: 1000 },
      { paket: 'enterprise', nama: 'Enterprise', limit: 5000 },
    ];
  }

  return settings;
}

async function updateRateLimitSettings(settings) {
  const updates = settings.map((s) =>
    prisma.pengaturanRateLimit.upsert({
      where: { paket: s.paket },
      update: { limit: s.limit },
      create: {
        paket: s.paket,
        nama: s.nama,
        limit: s.limit,
      },
    })
  );

  return prisma.$transaction(updates);
}

async function getDefaultTier() {
  const setting = await prisma.pengaturanRateLimit.findFirst({
    where: { paket: 'free' },
  });

  if (!setting) {
    return { paket: 'free', limit: 100 };
  }

  return setting;
}

async function setDefaultTier(paket) {
  const setting = await prisma.pengaturanRateLimit.findUnique({
    where: { paket },
  });

  if (!setting) {
    return null;
  }

  return { paket: setting.paket, limit: setting.limit };
}

module.exports = {
  buatApiKey,
  daftarApiKey,
  nonaktifkanApiKey,
  hapusApiKey,
  aktifkanApiKey,
  regenerasiApiKey,
  daftarSemuaApiKey,
  revokeApiKey,
  aktifkanKembaliApiKey,
  hapusApiKeyPermanen,
  getApiKeyStats,
  getRateLimitSettings,
  updateRateLimitSettings,
  getDefaultTier,
  setDefaultTier,
};
