import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config/index.js';

interface CustomLogger extends winston.Logger {
  getLevel(): string;
  setLevel(level: string): void;
}

const logger: CustomLogger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '14d',
      level: 'error',
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '1',
      maxFiles: '14d',
    }),
  ],
}) as CustomLogger;

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...rest }) => {
        let args = '';
        if (typeof message === 'object') {
          args = JSON.stringify(message, null, 2);
          message = '';
        }
        const extraArgs = Object.keys(rest).length
          ? JSON.stringify(rest, null, 2)
          : '';
        return `${timestamp} ${level}: ${message} ${args} ${extraArgs}`.trim();
      })
    ),
  }));
}

logger.getLevel = (): string => logger.level as string;
logger.setLevel = (level: string): void => {
  logger.level = level;
  logger.transports.forEach((transport) => {
    transport.level = level;
  });
};

export default logger;
