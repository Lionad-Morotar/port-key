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
}

interface Config {
  logging: LoggingConfig;
  server: ServerConfig;
  session: SessionConfig;
}

const config: Config = {
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 10945,
    streamable: process.env.STREAMABLE === 'true' || process.env.STREAMABLE === '1',
  },
  session: {
    ttl: parseInt(process.env.SESSION_TTL || '3600', 10),
  },
};

export default config;
