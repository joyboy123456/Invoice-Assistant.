/**
 * Logger utility for the AI Invoice Organizer System
 * Provides structured logging with different log levels
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: any;
  error?: Error;
}

export class Logger {
  private logLevel: LogLevel;
  private logLevelPriority: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3
  };

  constructor(logLevel?: LogLevel) {
    this.logLevel = logLevel || this.getLogLevelFromEnv();
  }

  /**
   * Get log level from environment variable
   */
  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    
    switch (envLevel) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return this.logLevelPriority[level] >= this.logLevelPriority[this.logLevel];
  }

  /**
   * Format log entry
   */
  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, meta, error } = entry;
    let formatted = `[${level.toUpperCase()}] ${timestamp} ${message}`;
    
    if (meta) {
      formatted += ` ${JSON.stringify(meta)}`;
    }
    
    if (error) {
      formatted += `\n  Error: ${error.message}`;
      if (error.stack && this.logLevel === LogLevel.DEBUG) {
        formatted += `\n  Stack: ${error.stack}`;
      }
    }
    
    return formatted;
  }

  /**
   * Get current timestamp in ISO format
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry: LogEntry = {
        timestamp: this.getTimestamp(),
        level: LogLevel.DEBUG,
        message,
        meta
      };
      console.log(this.formatLogEntry(entry));
    }
  }

  /**
   * Log info message
   */
  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry: LogEntry = {
        timestamp: this.getTimestamp(),
        level: LogLevel.INFO,
        message,
        meta
      };
      console.log(this.formatLogEntry(entry));
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry: LogEntry = {
        timestamp: this.getTimestamp(),
        level: LogLevel.WARN,
        message,
        meta
      };
      console.warn(this.formatLogEntry(entry));
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, meta?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry: LogEntry = {
        timestamp: this.getTimestamp(),
        level: LogLevel.ERROR,
        message,
        error,
        meta
      };
      console.error(this.formatLogEntry(entry));
    }
  }

  /**
   * Log request information
   */
  logRequest(method: string, path: string, meta?: any): void {
    this.info(`${method} ${path}`, meta);
  }

  /**
   * Log response information
   */
  logResponse(method: string, path: string, statusCode: number, duration: number): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    const message = `${method} ${path} ${statusCode} - ${duration}ms`;
    
    if (level === LogLevel.WARN) {
      this.warn(message);
    } else {
      this.info(message);
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, meta?: any): void {
    this.debug(`Performance: ${operation} completed in ${duration}ms`, meta);
  }

  /**
   * Log memory usage
   */
  logMemoryUsage(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const usage = process.memoryUsage();
      const memoryInfo = {
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`
      };
      this.debug('Memory usage', memoryInfo);
    }
  }

  /**
   * Set log level dynamically
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info(`Log level changed to ${level}`);
  }

  /**
   * Get current log level
   */
  getLogLevel(): LogLevel {
    return this.logLevel;
  }
}

// Create and export a default logger instance
export const logger = new Logger();

/**
 * Request logging middleware for Express
 */
export function requestLogger() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Log request
    logger.logRequest(req.method, req.path, {
      query: req.query,
      body: req.body ? '[BODY]' : undefined
    });
    
    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.logResponse(req.method, req.path, res.statusCode, duration);
    });
    
    next();
  };
}

/**
 * Error logging middleware for Express
 */
export function errorLogger() {
  return (err: Error, req: any, res: any, next: any) => {
    logger.error(`Error in ${req.method} ${req.path}`, err, {
      query: req.query,
      body: req.body ? '[BODY]' : undefined
    });
    next(err);
  };
}
