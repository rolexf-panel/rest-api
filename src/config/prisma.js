const { PrismaClient } = require('@prisma/client');

// Singleton pattern untuk Prisma Client
// Mencegah multiple instances saat hot-reload di development

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['warn', 'error'],
    });
  }
  prisma = global.prisma;
}

module.exports = prisma;
