import { Body, Controller, Get, Headers, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Public } from '@/shared/decorators/public.decorator';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { UserRoles } from '@/shared/decorators/user-role.decorator';
import { RawBody } from '@/shared/decorators/raw-body.decorator';
import { UserRole } from '@/shared/enums/role.enum';
import { PAYMENT_SERVICE, type IPaymentService, } from './services/interfaces/payment.service.interface';
import { CreateCheckoutDto, PaymentQueryDto, RefundPaymentDto } from './dto/request/payment.request.dto';
import { CheckoutResponseDto, PaginatedPaymentsResponseDto, PaymentResponseDto, } from './dto/response/payment.response.dto';

@ApiTags('Payments')
@Controller()
export class PaymentController {
    constructor(
        @Inject(PAYMENT_SERVICE)
        private readonly _paymentService: IPaymentService,
    ) { }

    @Post('payments/checkout')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Create a Razorpay checkout session for a booking' })
    @ApiCreatedResponse({ type: CheckoutResponseDto })
    async createCheckout(@UserId() userId: string, @Body() dto: CreateCheckoutDto): Promise<CheckoutResponseDto> {
        return this._paymentService.createCheckout(userId, dto.bookingId);
    }

    @Post('payments/dev-confirm')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Simulate successful payment confirmation in development' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async confirmDevPayment(@UserId() userId: string, @Body() dto: CreateCheckoutDto): Promise<PaymentResponseDto> {
        return this._paymentService.confirmDevPayment(userId, dto.bookingId);
    }

    @Post('payments/fail')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Record client-side payment failure for a booking' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async recordFailure(@UserId() userId: string, @Body() dto: { bookingId: string; reason?: string }): Promise<PaymentResponseDto> {
        return this._paymentService.recordPaymentFailure(userId, dto.bookingId, dto.reason);
    }

    @Post('payments/webhook')
    @Public()
    @ApiOperation({ summary: 'Razorpay webhook endpoint' })
    @ApiOkResponse({ description: 'Webhook processed' })
    async handleWebhook(@RawBody() rawBody: Buffer, @Headers('x-razorpay-signature') signature: string) {
        await this._paymentService.handleWebhook(rawBody, signature);
        return { received: true };
    }

    @Get('payments/:paymentId')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Get a payment by ID' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async getPayment(@UserId() userId: string, @Param('paymentId') paymentId: string): Promise<PaymentResponseDto> {
        return this._paymentService.getPayment(paymentId, userId);
    }

    @Get('payments/booking/:bookingId')
    @Roles(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get payment for a booking' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async getPaymentByBooking(
        @UserId() userId: string,
        @UserRoles() roles: UserRole[],
        @Param('bookingId') bookingId: string,
    ): Promise<PaymentResponseDto> {
        return this._paymentService.getPaymentByBooking(bookingId, userId, roles);
    }

    @Get('payments')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'List student payments' })
    @ApiOkResponse({ type: PaginatedPaymentsResponseDto })
    async listStudentPayments(@UserId() userId: string, @Query() query: PaymentQueryDto): Promise<PaginatedPaymentsResponseDto> {
        return this._paymentService.listStudentPayments(userId, query);
    }

    @Post('payments/booking/:bookingId/refund')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Refund a payment (admin only)' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async refundPayment(@UserId() userId: string, @Param('bookingId') bookingId: string, @Body() dto: RefundPaymentDto): Promise<PaymentResponseDto> {
        return this._paymentService.refundPayment(bookingId, userId, dto.reason);
    }

    @Get('admin/payments')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'List all payments (admin)' })
    @ApiOkResponse({ type: PaginatedPaymentsResponseDto })
    async listAdminPayments(@Query() query: PaymentQueryDto): Promise<PaginatedPaymentsResponseDto> {
        return this._paymentService.listAdminPayments(query);
    }

    @Get('admin/payments/:paymentId')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get payment by ID (admin)' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async getAdminPayment(@Param('paymentId') paymentId: string): Promise<PaymentResponseDto> {
        return this._paymentService.getAdminPayment(paymentId);
    }
}