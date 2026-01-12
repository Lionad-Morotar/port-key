import dotenv from 'dotenv';

dotenv.config();

interface LoggingConfig {
  level: string;
}

interface ServerConfig {
  port: number;
  streamable: boolean;
}

interface SessionConfig {
  ttl: number;
  timeout: number;
}

interface HealthConfig {
  enableDiskCheck: boolean;
  enableMemoryCheck: boolean;
  enableSessionCheck: boolean;
  diskThreshold: number;
  memoryThreshold: number;
}

interface Config {
  logging: LoggingConfig;
  server: ServerConfig;
  session: SessionConfig;
  health: HealthConfig;
}

const config: Config = {
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    streamable: process.env.STREAMABLE === 'true' || process.env.STREAMABLE === '1',
  },
  session: {
    ttl: parseInt(process.env.SESSION_TTL || '3600', 10),
    timeout: parseInt(process.env.SESSION_TIMEOUT || '300000', 10),
  },
  health: {
    enableDiskCheck: process.env.ENABLE_DISK_CHECK !== 'false',
    enableMemoryCheck: process.env.ENABLE_MEMORY_CHECK !== 'false',
    enableSessionCheck: process.env.ENABLE_SESSION_CHECK !== 'false',
    diskThreshold: parseInt(process.env.DISK_THRESHOLD || '1024', 10),
    memoryThreshold: parseInt(process.env.MEMORY_THRESHOLD || '512', 10),
  },
};

export default config;
