type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDev = import.meta.env.DEV;
  private isProd = import.meta.env.PROD;

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (this.isDev) {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        formattedMessage,
        data || ''
      );
    }

    if (this.isProd && level === 'error') {
      // Enviar para serviço de logging (Sentry, Datadog, etc)
      // this.sendToService(level, message, data);
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: any) {
    this.log('error', message, error);
  }

  debug(message: string, data?: any) {
    if (this.isDev) {
      this.log('debug', message, data);
    }
  }
}

export const logger = new Logger();
