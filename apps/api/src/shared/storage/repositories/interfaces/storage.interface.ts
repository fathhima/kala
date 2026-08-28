import { CreateDownloadUrlInput } from "../../types/create-download-url.type";
import { CreateUploadUrlInput } from "../../types/create-upload-url.type";
import { PresignedDownload } from "../../types/presigned-download.type";
import { PresignedUpload } from "../../types/presigned-upload.type";
import { StoredObjectMetadata } from "../../types/stored-object.type";

export const OBJECT_STORAGE_PROVIDER = Symbol('OBJECT_STORAGE_PROVIDER',);

export interface IObjectStorageProvider {
    createUploadUrl(input: CreateUploadUrlInput,): Promise<PresignedUpload>;

    createDownloadUrl(input: CreateDownloadUrlInput,): Promise<PresignedDownload>;

    getObjectMetadata(key: string,): Promise<StoredObjectMetadata | null>;

    deleteObject(key: string): Promise<void>;
}