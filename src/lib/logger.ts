export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  referralCode?: string;
  transactionId?: string;
  amount?: string;
  currency?: string;
}

export class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context, null, 2) : '';

    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr ? '\nContext: ' + contextStr : ''}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedMessage);
        }
        break;
    }

    if (process.env.NODE_ENV === 'production' && level === LogLevel.ERROR) {
      this.sendToErrorTracking(message, context);
    }
  }

  private sendToErrorTracking(message: string, context?: LogContext): void {
    // In production, integrate with error tracking services like Sentry, LogRocket, etc.
    // For now, we'll just ensure it's logged
    try {
      // Example: Sentry.captureMessage(message, { extra: context });
    } catch (error) {
      console.error('Failed to send error to tracking service:', error);
    }
  }

  public error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Specific methods for common scenarios
  public logReferralError(message: string, context: LogContext): void {
    this.error(`Referral System Error: ${message}`, {
      ...context,
      component: 'referral'
    });
  }

  public logDepositError(message: string, context: LogContext): void {
    this.error(`Deposit Error: ${message}`, {
      ...context,
      component: 'deposit'
    });
  }

  public logAuthError(message: string, context: LogContext): void {
    this.error(`Authentication Error: ${message}`, {
      ...context,
      component: 'auth'
    });
  }

  public logApiRequest(context: LogContext): void {
    this.info(`API Request: ${context.method} ${context.endpoint}`, {
      ...context,
      component: 'api'
    });
  }

  public logApiResponse(context: LogContext): void {
    this.info(`API Response: ${context.statusCode}`, {
      ...context,
      component: 'api'
    });
  }
}

export const logger = Logger.getInstance();