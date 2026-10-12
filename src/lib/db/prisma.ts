import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

// Ensure WebSockets work in Node.js runtime
if (typeof WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_LZdTg2EN8OlP@ep-summer-resonance-b4bfzhha-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
