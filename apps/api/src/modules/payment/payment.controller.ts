import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RbacGuard, RequirePermissions } from '../../common/guards/rbac.guard';
import { CurrentMahal } from '../../common/decorators/current-mahal.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  paymentOrderFilterSchema,
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  PaymentOrderFilterDto,
  JwtPayload,
} from '@maheall/shared';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create Razorpay / Sandbox payment order
   */
  @Post('create-order')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
  @RequirePermissions('PAY_PIRIVU', 'RECORD_PIRIVU', 'CREATE_INCOME')
  async createOrder(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createPaymentOrderSchema)) dto: CreatePaymentOrderDto,
  ) {
    const data = await this.paymentService.createOrder(mahalId, dto, user.sub);
    return { success: true, data };
  }

  /**
   * Client-side Razorpay payment verification
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, TenantGuard)
  async verifyPayment(
    @CurrentMahal() mahalId: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(verifyPaymentSchema)) dto: VerifyPaymentDto,
  ) {
    const data = await this.paymentService.verifyPayment(mahalId, user.sub, dto);
    return { success: true, data };
  }

  /**
   * Public Razorpay Webhook listener (Raw body signature verified)
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string | undefined,
    @Body() body: Record<string, unknown>,
    @Req() req: FastifyRequest,
  ) {
    const rawBody = (req as unknown as { rawBody?: string | Buffer }).rawBody || body;
    const result = await this.paymentService.handleWebhook(signature, rawBody);
    return result;
  }

  /**
   * Get payment order status by order ID
   */
  @Get('orders/:id/status')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getOrderStatus(
    @CurrentMahal() mahalId: string,
    @Param('id') id: string,
  ) {
    const data = await this.paymentService.getOrderStatus(mahalId, id);
    return { success: true, data };
  }

  /**
   * List payment orders
   */
  @Get('orders')
  @UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
  @RequirePermissions('VIEW_INCOME', 'VIEW_REPORTS', 'RECORD_PIRIVU')
  async listOrders(
    @CurrentMahal() mahalId: string,
    @Query(new ZodValidationPipe(paymentOrderFilterSchema)) query: PaymentOrderFilterDto,
  ) {
    const data = await this.paymentService.listOrders(mahalId, query);
    return { success: true, ...data };
  }
}
