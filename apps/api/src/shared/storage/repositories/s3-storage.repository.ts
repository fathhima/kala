import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, S3ServiceException, } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IObjectStorageProvider } from './interfaces/storage.interface';
import { CreateUploadUrlInput } from '../types/create-upload-url.type';
import { PresignedUpload } from '../types/presigned-upload.type';
import { CreateDownloadUrlInput } from '../types/create-download-url.type';
import { PresignedDownload } from '../types/presigned-download.type';
import { StoredObjectMetadata } from '../types/stored-object.type';

@Injectable()
export class S3ObjectStorageProvider implements IObjectStorageProvider {
    private readonly _client: S3Client;
    private readonly _bucket: string;

    constructor(private readonly _configService: ConfigService) {
        this._bucket = this._configService.getOrThrow<string>('AWS_S3_BUCKET');

        this._client = new S3Client({ region: this._configService.getOrThrow<string>('AWS_REGION'), });
    }

    async createUploadUrl(input: CreateUploadUrlInput,): Promise<PresignedUpload> {
        const command = new PutObjectCommand({
            Bucket: this._bucket,
            Key: input.key,
            ContentType: input.contentType,
        });

        const uploadUrl = await getSignedUrl(this._client, command, {
            expiresIn: input.expiresInSeconds,
        });

        return {
            key: input.key,
            uploadUrl,
            expiresInSeconds: input.expiresInSeconds,
        };
    }

    async createDownloadUrl(input: CreateDownloadUrlInput,): Promise<PresignedDownload> {
        const command = new GetObjectCommand({
            Bucket: this._bucket,
            Key: input.key,
        });

        const viewUrl = await getSignedUrl(this._client, command, {
            expiresIn: input.expiresInSeconds,
        });

        return {
            key: input.key,
            viewUrl,
            expiresInSeconds: input.expiresInSeconds,
        };
    }

    async getObjectMetadata(key: string,): Promise<StoredObjectMetadata | null> {
        try {
            const result = await this._client.send(
                new HeadObjectCommand({
                    Bucket: this._bucket,
                    Key: key,
                }),
            );

            return {
                contentType: result.ContentType,
                sizeBytes: result.ContentLength ?? 0,
            };
        } catch (error) {
            if (error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404) {
                return null;
            }

            throw error;
        }
    }

    async deleteObject(key: string): Promise<void> {
        await this._client.send(
            new DeleteObjectCommand({
                Bucket: this._bucket,
                Key: key,
            }),
        );
    }
}