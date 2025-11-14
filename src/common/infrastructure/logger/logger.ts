const logger = require('pino')();

export class Logger {
  error(msg: any) {
    logger.error(msg);
  }

  info(msg: any) {
    logger.info(msg);
  }
}
