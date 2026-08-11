export type PresignedUpload = {
    key: string;
    uploadUrl: string;
    expiresInSeconds: number;
};