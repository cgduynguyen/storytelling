/**
 * Prisma Client Singleton
 *
 * Ensures a single Prisma Client instance is used across the application.
 * In development, this prevents connection pool exhaustion during hot-reload.
 *
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

import { PrismaClient } from '@prisma/client';

// Extend NodeJS global type to include prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Instantiate PrismaClient with logging in development
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

// Use global variable in development to prevent multiple instances during hot-reload
const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
