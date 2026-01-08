// Directly import from the generated path to bypass any stale module caching
import { PrismaClient } from '../../node_modules/.prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
})

const PRISMA_KEY = 'prisma_v3'
const globalWithKey = globalThis as any;

if (!globalWithKey[PRISMA_KEY]) {
    globalWithKey[PRISMA_KEY] = new PrismaClient({ adapter });
}

export const prisma = globalWithKey[PRISMA_KEY] as PrismaClient;
