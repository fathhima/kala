import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger as WinstonLogger } from 'winston';
import { ILoggerProvider } from './interfaces/logger.interface';
import { createWinstonInstance } from './create-winston-instance';
import { LogLevel } from '../types/log-level.type';
import { LogMeta } from '../types/log-meta.type';

@Injectable()
export class WinstonLoggerProvider implements ILoggerProvider {
    private readonly _logger: WinstonLogger;

    constructor(private readonly _configService: ConfigService) {
        this._logger = createWinstonInstance({
            env: this._configService.get<string>('NODE_ENV'),
            level: this._configService.get<LogLevel>('LOG_LEVEL'),
        });
    }

    log(message: string, context?: string, meta?: LogMeta): void {
        this._logger.info(message, { context, ...meta });
    }

    error(
        message: string,
        trace?: string,
        context?: string,
        meta?: LogMeta,
    ): void {
        this._logger.error(message, { context, stack: trace, ...meta });
    }

    warn(message: string, context?: string, meta?: LogMeta): void {
        this._logger.warn(message, { context, ...meta });
    }

    debug(message: string, context?: string, meta?: LogMeta): void {
        this._logger.debug(message, { context, ...meta });
    }

    verbose(message: string, context?: string, meta?: LogMeta): void {
        this._logger.verbose(message, { context, ...meta });
    }
}