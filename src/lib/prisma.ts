import { PrismaClient } from "@prisma/client";

// TypeScript için global tanım
declare global {
  var prisma: PrismaClient | undefined;
}

// Mevcut global instance'ı kullan veya yeni oluştur
const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // Geliştirme için logları aç
  });

// Development ortamında global instance'ı kaydet
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
