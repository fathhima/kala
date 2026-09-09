import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { createLogger, format, transports } from 'winston';
import { LogLevel } from '../types/log-level.type';

type CreateWinstonInstanceOptions = {
    appName?: string;
    env?: string;
    level?: LogLevel;
};

export function createWinstonInstance(
    options: CreateWinstonInstanceOptions = {},
) {
    const env = options.env ?? process.env.NODE_ENV ?? 'development';
    const level = options.level ?? (env === 'production' ? 'info' : 'debug');
    const appName = options.appName ?? 'kala';
    const isProduction = env === 'production';

    const consoleFormat = isProduction
        ? format.combine(
            format.timestamp(),
            format.errors({ stack: true }),
            format.json(),
        )
        : format.combine(
            format.timestamp({ format: 'HH:mm:ss' }),
            format.ms(),
            format.errors({ stack: true }),
            nestWinstonModuleUtilities.format.nestLike(appName, {
                colors: true,
                prettyPrint: true,
                processId: false,
                appName: true,
            }),
        );

    return createLogger({
        level,
        defaultMeta: { service: appName, env },
        transports: [new transports.Console({ format: consoleFormat })],
    });
}