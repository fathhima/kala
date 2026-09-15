import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { S3ObjectStorageProvider } from './repositories/s3-storage.repository';
import { OBJECT_STORAGE_PROVIDER, STORAGE_SERVICE } from './repositories/interfaces/storage.interface';


@Module({
    providers: [
        StorageService,
        S3ObjectStorageProvider,
        {
            provide: OBJECT_STORAGE_PROVIDER,
            useExisting: S3ObjectStorageProvider,
        },
        { provide: STORAGE_SERVICE, useExisting: StorageService }
    ],
    exports: [STORAGE_SERVICE],
})
export class StorageModule { }