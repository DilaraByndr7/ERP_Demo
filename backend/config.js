import 'dotenv/config'

const parseOrigins = (value) => {
  if (!value) {
    return ['http://localhost:5173', 'http://localhost:5174']
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

const isLocalDatabaseUrl = (value) => {
  try {
    const url = new URL(value)
    return ['localhost', '127.0.0.1'].includes(url.hostname)
  } catch {
    return false
  }
}

export const config = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  databaseUrl:
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/erp_demo',
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  postgresDataDir: process.env.PGDATA || `${process.env.USERPROFILE || ''}\\postgres-data`,
  postgresBinDir:
    process.env.PG_BIN_DIR ||
    `${process.env.USERPROFILE || ''}\\Downloads\\postgresql-18.3-2-windows-x64-binaries\\pgsql\\bin`,
  allowDestructiveSeed: process.env.ALLOW_DESTRUCTIVE_SEED === 'true',
  isLocalDatabase: isLocalDatabaseUrl(
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/erp_demo',
  ),
}


if (config.nodeEnv === 'production') {
  const secret = process.env.JWT_SECRET
  if (!secret || secret === 'your-secret-key-here') {
    console.error(
      '[CONFIG] Production ortamında JWT_SECRET environment variable zorunludur ve güçlü bir değer olmalıdır.',
    )
    process.exit(1)
  }
}
