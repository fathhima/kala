import { Inject, Injectable } from '@nestjs/common';
import { OBJECT_STORAGE_PROVIDER, type ObjectStorageProvider, } from './repositories/interfaces/storage.repository';
import { CreateUploadUrlInput } from './types/create-upload-url.type';
import { PresignedUpload } from './types/presigned-upload.type';
import { CreateDownloadUrlInput } from './types/create-download-url.type';
import { PresignedDownload } from './types/presigned-download.type';
import { StoredObjectMetadata } from './types/stored-object.type';

@Injectable()
export class StorageService {
    constructor(
        @Inject(OBJECT_STORAGE_PROVIDER)
        private readonly objectStorageProvider: ObjectStorageProvider,
    ) { }

    createUploadUrl(input: CreateUploadUrlInput,): Promise<PresignedUpload> {
        return this.objectStorageProvider.createUploadUrl(input);
    }

    createDownloadUrl(input: CreateDownloadUrlInput,): Promise<PresignedDownload> {
        return this.objectStorageProvider.createDownloadUrl(input);
    }

    getObjectMetadata(key: string,): Promise<StoredObjectMetadata | null> {
        return this.objectStorageProvider.getObjectMetadata(key);
    }

    deleteObject(key: string): Promise<void> {
        return this.objectStorageProvider.deleteObject(key);
    }
}