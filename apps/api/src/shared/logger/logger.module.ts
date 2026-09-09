import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { WinstonLoggerProvider } from './repositories/winston-logger.repository';
import { LOGGER_PROVIDER } from './repositories/interfaces/logger.interface';

@Global()
@Module({
    providers: [
        LoggerService,
        WinstonLoggerProvider,
        {
            provide: LOGGER_PROVIDER,
            useExisting: WinstonLoggerProvider,
        },
    ],
    exports: [LoggerService],
})
export class LoggerModule { }