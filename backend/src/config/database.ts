import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Parse DATABASE_URL (Render/Heroku format) into TypeORM config
 * Format: postgresql://user:password@host:port/database
 */
function parseDatabaseUrl(url: string) {
  try {
    const dbUrl = new URL(url);
    return {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port, 10),
      username: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1), // Remove leading '/'
      ssl: dbUrl.searchParams.get('sslmode') === 'require',
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${url}`);
  }
}

/**
 * Get TypeORM configuration from environment
 * Supports both DATABASE_URL (production) and individual env vars (development)
 */
export function getDatabaseConfig(): TypeOrmModuleOptions {
  // Priority 1: Parse DATABASE_URL if provided (Render, Heroku, etc.)
  if (process.env.DATABASE_URL) {
    const parsed = parseDatabaseUrl(process.env.DATABASE_URL);
    return {
      type: 'postgres',
      host: parsed.host,
      port: parsed.port,
      username: parsed.username,
      password: parsed.password,
      database: parsed.database,
      ssl: { rejectUnauthorized: false },
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      retryAttempts: 10,
      retryDelay: 3000,
      connectTimeoutMS: 10000,
    };
  }

  // Priority 2: Use individual environment variables (local development)
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USER || 'pristine',
    password: process.env.DATABASE_PASSWORD || 'change-me',
    database: process.env.DATABASE_NAME || 'pristine_hospital',
    ssl: false,
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    retryAttempts: 10,
    retryDelay: 3000,
    connectTimeoutMS: 10000,
  };
}
