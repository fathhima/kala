import { LogMeta } from "../../types/log-meta.type";

export const LOGGER_PROVIDER = Symbol('LOGGER_PROVIDER');

export interface ILoggerProvider {
    log(message: string, context?: string, meta?: LogMeta): void;
    error(message: string, trace?: string, context?: string, meta?: LogMeta): void;
    warn(message: string, context?: string, meta?: LogMeta): void;
    debug(message: string, context?: string, meta?: LogMeta): void;
    verbose(message: string, context?: string, meta?: LogMeta): void;
}