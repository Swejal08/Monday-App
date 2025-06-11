import winston from 'winston';
import Logger from '@/logger/logger';

class WinstonLogger extends Logger {
  private logger: winston.Logger;

  constructor() {
    super();

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [new winston.transports.Console()],
    });
  }

  info(message: string, meta: object = {}) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta: object = {}) {
    this.logger.warn(message, meta);
  }

  error(message: string, meta: object = {}) {
    this.logger.error(message, meta);
  }

  debug(message: string, meta: object = {}) {
    this.logger.debug(message, meta);
  }
}

export default WinstonLogger;
