import { PrismaClient } from '@prisma/client'

// Create a single Prisma client for the whole backend.
// This avoids multiple connection pools and makes retry/warmup easier.
const prisma = new PrismaClient()

export default prisma

