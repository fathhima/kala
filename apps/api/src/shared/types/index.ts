import { ApiProperty } from "@nestjs/swagger"
export * from '@/shared/types/http-response';
// export * from '@/shared/types/razorpay';
export * from '@/shared/types/paginated-result';
export * from '@/shared/types/pagination-meta';

export class HttpResponse {

    @ApiProperty()
    message: string

    @ApiProperty()
    data: any
}

export class MessageOnlyHttpResponse {
    @ApiProperty({ example: "request successful" })
    message: string
}

export interface IHTTP_PAGINATED_RESPONSE {
    total?: number;
    limit?: number;
    page?: number;
}

export interface IJWTPayload {
    sub: string;
    role: Array<'user' | 'admin'>;
}

export interface IRequestUser {
    id: string;
    role: 'user' | 'admin';
}



