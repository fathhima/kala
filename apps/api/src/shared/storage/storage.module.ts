import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { S3ObjectStorageProvider } from './repositories/s3-storage.repository';
import { OBJECT_STORAGE_PROVIDER } from './repositories/interfaces/storage.repository';


@Module({
    providers: [
        StorageService,
        S3ObjectStorageProvider,
        {
            provide: OBJECT_STORAGE_PROVIDER,
            useExisting: S3ObjectStorageProvider,
        },
    ],
    exports: [StorageService],
})
export class StorageModule { }