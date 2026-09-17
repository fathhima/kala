import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { WinstonLoggerProvider } from './repositories/winston-logger.repository';
import { LOGGER_PROVIDER, LOGGER_SERVICE } from './repositories/interfaces/logger.interface';

@Global()
@Module({
    providers: [
        {
            provide: LOGGER_SERVICE,
            useClass: LoggerService,
        },
        WinstonLoggerProvider,
        {
            provide: LOGGER_PROVIDER,
            useExisting: WinstonLoggerProvider,
        },
    ],
    exports: [LOGGER_SERVICE],
})
export class LoggerModule { }