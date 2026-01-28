const FRIENDLY_DB_DOWN_MESSAGE =
  'Database is temporarily unavailable (it may be waking up). Please try again in a few seconds.'

/**
 * Prisma connectivity errors you typically see when Neon is waking up / unreachable.
 * - P1001: Can't reach database server
 */
export function isDbUnavailableError(err) {
  if (!err) return false

  // Prisma often attaches `code` for known errors.
  if (err.code === 'P1001') return true

  // Fallback: sometimes the error is wrapped and only message is present.
  const msg = String(err.message || '')
  if (msg.includes("Can't reach database server")) return true
  if (msg.includes('PrismaClientInitializationError')) return true

  return false
}

export function toDbUnavailableResponse() {
  return { status: 503, body: { error: FRIENDLY_DB_DOWN_MESSAGE } }
}

