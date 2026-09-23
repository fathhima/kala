import { Inject, Injectable, LoggerService as NestLoggerService, } from '@nestjs/common';
import { ILoggerService, LOGGER_PROVIDER, type ILoggerProvider, } from './repositories/interfaces/logger.interface';
import { LogMeta } from './types/log-meta.type';

@Injectable()
export class LoggerService implements NestLoggerService, ILoggerService {
    constructor(
        @Inject(LOGGER_PROVIDER)
        private readonly _loggerProvider: ILoggerProvider,
    ) { }

    log(message: string, context?: string, meta?: LogMeta): void {
        this._loggerProvider.log(message, context, meta);
    }

    error(message: string, trace?: string, context?: string, meta?: LogMeta,): void {
        this._loggerProvider.error(message, trace, context, meta);
    }

    warn(message: string, context?: string, meta?: LogMeta): void {
        this._loggerProvider.warn(message, context, meta);
    }

    debug(message: string, context?: string, meta?: LogMeta): void {
        this._loggerProvider.debug(message, context, meta);
    }

    verbose(message: string, context?: string, meta?: LogMeta): void {
        this._loggerProvider.verbose(message, context, meta);
    }
}