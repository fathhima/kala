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
import { PaymentListQuery } from './types/payment.type';

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
    async createCheckout(@UserId() userId: string, @Body() dto: CreateCheckoutDto) {
        const checkout = await this._paymentService.createCheckout(userId, dto.bookingId);

        return CheckoutResponseDto.fromEntity('Checkout session created successfully', checkout);
    }

    @Post('payments/dev-confirm')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Simulate successful payment confirmation in development' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async confirmDevPayment(@UserId() userId: string, @Body() dto: CreateCheckoutDto) {
        const payment = await this._paymentService.confirmDevPayment(userId, dto.bookingId);

        return PaymentResponseDto.fromEntity('Payment confirmed in development mode', payment);
    }

    @Post('payments/fail')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Record client-side payment failure for a booking' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async recordFailure(@UserId() userId: string, @Body() dto: { bookingId: string; reason?: string }) {
        const payment = await this._paymentService.recordPaymentFailure(userId, dto.bookingId, dto.reason);

        return PaymentResponseDto.fromEntity('Payment marked as failed', payment);
    }

    @Post('payments/webhook')
    @Public()
    @ApiOperation({ summary: 'Razorpay webhook endpoint' })
    @ApiOkResponse({ description: 'Webhook processed' })
    async handleWebhook(@RawBody() rawBody: Buffer, @Headers('x-razorpay-signature') signature: string,) {
        await this._paymentService.handleWebhook(rawBody, signature);

        return { received: true };
    }

    @Get('payments/:paymentId')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Get a payment by ID' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async getPayment(@UserId() userId: string, @Param('paymentId') paymentId: string) {
        const payment = await this._paymentService.getPayment(paymentId, userId);

        return PaymentResponseDto.fromEntity('Payment fetched successfully', payment);
    }

    @Get('payments/booking/:bookingId')
    @Roles(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get payment for a booking' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async getPaymentByBooking(
        @UserId() userId: string,
        @UserRoles() roles: UserRole[],
        @Param('bookingId') bookingId: string,
    ) {
        const payment = await this._paymentService.getPaymentByBooking(bookingId, userId, roles);

        return PaymentResponseDto.fromEntity('Payment fetched successfully', payment);
    }

    @Get('payments')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'List student payments' })
    @ApiOkResponse({ type: PaginatedPaymentsResponseDto })
    async listStudentPayments(@UserId() userId: string, @Query() query: PaymentQueryDto) {
        const payments = await this._paymentService.listStudentPayments(userId, this._toListQuery(query),);

        return PaginatedPaymentsResponseDto.fromEntity('Payments fetched successfully', payments);
    }

    @Post('payments/booking/:bookingId/refund')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Refund a payment (admin only)' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async refundPayment(@UserId() userId: string, @Param('bookingId') bookingId: string, @Body() dto: RefundPaymentDto,) {
        const payment = await this._paymentService.refundPayment(bookingId, userId, dto.reason,);

        return PaymentResponseDto.fromEntity('Payment refunded successfully', payment);
    }

    @Get('admin/payments')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'List all payments (admin)' })
    @ApiOkResponse({ type: PaginatedPaymentsResponseDto })
    async listAdminPayments(@Query() query: PaymentQueryDto) {
        const payments = await this._paymentService.listAdminPayments(this._toListQuery(query));

        return PaginatedPaymentsResponseDto.fromEntity('Payments fetched successfully', payments);
    }

    @Get('admin/payments/:paymentId')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get payment by ID (admin)' })
    @ApiOkResponse({ type: PaymentResponseDto })
    async getAdminPayment(@Param('paymentId') paymentId: string) {
        const payment = await this._paymentService.getAdminPayment(paymentId);

        return PaymentResponseDto.fromEntity('Payment fetched successfully', payment);
    }

    private _toListQuery(query: PaymentQueryDto): PaymentListQuery {
        return {
            status: query.status,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
            page: query.page ?? 1,
            limit: query.limit ?? 20,
        };
    }
}