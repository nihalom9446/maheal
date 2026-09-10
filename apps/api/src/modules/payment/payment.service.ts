import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, desc, count } from 'drizzle-orm';
import * as crypto from 'crypto';
import axios from 'axios';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import {
  payment_orders,
  payment_transactions,
  pirivu_collections,
  income_records,
  families,
  users,
} from '../../database/schema';
import {
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  RazorpayWebhookPayload,
  PaymentOrderFilterDto,
  CreateOrderResponse,
  PaymentVerificationResult,
  PaymentStatusResponse,
  PaymentOrderItem,
} from '@maheall/shared';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new payment order for Pirivu, Donation, or Madrasa Fee
   */
  async createOrder(
    mahalId: string,
    dto: CreatePaymentOrderDto,
    userId: string,
  ): Promise<CreateOrderResponse> {
    // 1. Verify family exists in the current tenant Mahal
    const [family] = await this.db
      .select({
        id: families.id,
        house_name: families.house_name,
        family_number: families.family_number,
      })
      .from(families)
      .where(and(eq(families.id, dto.family_id), eq(families.mahal_id, mahalId)))
      .limit(1);

    if (!family) {
      throw new NotFoundException('Family not found in this Mahal');
    }

    const idempotencyKey = crypto.randomUUID();
    const amountInPaise = Math.round(dto.amount * 100);
    const receiptCode = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const razorpayEnabled = this.configService.get<boolean>('RAZORPAY_ENABLED') ?? false;
    const razorpayKeyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const razorpayKeySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    let razorpayOrderId = '';
    let razorpayResponse = '';
    let isMock = true;

    // 2. If Razorpay is enabled and configured, create order via Razorpay API
    if (razorpayEnabled && razorpayKeyId && razorpayKeySecret) {
      try {
        const authHeader = `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')}`;
        const response = await axios.post<{ id: string; [key: string]: unknown }>(
          'https://api.razorpay.com/v1/orders',
          {
            amount: amountInPaise,
            currency: 'INR',
            receipt: receiptCode,
            notes: {
              mahal_id: mahalId,
              family_id: dto.family_id,
              purpose: dto.purpose,
              notes: dto.notes || '',
            },
          },
          {
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
          },
        );

        razorpayOrderId = response.data.id;
        razorpayResponse = JSON.stringify(response.data);
        isMock = false;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: unknown }; message?: string };
        this.logger.error('Razorpay API order creation failed', axiosErr.response?.data || axiosErr.message);
        throw new BadRequestException('Failed to initiate payment gateway order');
      }
    } else {
      // Sandbox / manual settlement mode
      razorpayOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      razorpayResponse = JSON.stringify({
        id: razorpayOrderId,
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptCode,
        status: 'created',
        mock: true,
      });
      isMock = true;
    }

    // 3. Insert order record into payment_orders
    const [order] = await this.db
      .insert(payment_orders)
      .values({
        mahal_id: mahalId,
        family_id: dto.family_id,
        user_id: userId,
        razorpay_order_id: razorpayOrderId,
        amount: String(dto.amount),
        currency: 'INR',
        purpose: dto.purpose || 'PIRIVU',
        months_covered: (dto.payment_months && dto.payment_months.length > 0) ? dto.payment_months : null,
        idempotency_key: idempotencyKey,
        status: 'CREATED',
        razorpay_response: razorpayResponse || null,
      })
      .returning();

    return {
      order_id: order.id,
      razorpay_order_id: order.razorpay_order_id,
      amount: Number(order.amount),
      currency: order.currency,
      purpose: order.purpose,
      key_id: razorpayKeyId || 'rzp_test_mock_key',
      is_mock: isMock,
      receipt: receiptCode,
      notes: dto.notes ?? null,
    };
  }

  /**
   * Handle incoming Razorpay Webhook notification
   */
  async handleWebhook(
    signature: string | undefined,
    rawBody: Buffer | string | Record<string, unknown>,
  ): Promise<{ success: boolean; message: string; order_id?: string }> {
    const rawBodyString = Buffer.isBuffer(rawBody)
      ? rawBody.toString('utf8')
      : typeof rawBody === 'string'
      ? rawBody
      : JSON.stringify(rawBody);

    const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');

    // 1. Verify HMAC SHA256 Signature if secret is configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBodyString)
        .digest('hex');

      if (expectedSignature !== signature) {
        this.logger.warn('Razorpay webhook signature verification failed');
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    let payload: RazorpayWebhookPayload;
    try {
      payload = typeof rawBody === 'object' && !Buffer.isBuffer(rawBody)
        ? (rawBody as RazorpayWebhookPayload)
        : JSON.parse(rawBodyString);
    } catch {
      throw new BadRequestException('Invalid JSON payload');
    }

    const event = payload.event;
    this.logger.log(`Received Razorpay webhook event: ${event}`);

    // Process payment.captured or order.paid
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;
    const paymentMethod = paymentEntity?.method || 'GATEWAY';
    const vpa = paymentEntity?.vpa || null;
    const amountPaid = paymentEntity?.amount ? Number(paymentEntity.amount) / 100 : null;

    if (!razorpayOrderId) {
      return { success: true, message: 'Event ignored: No order ID' };
    }

    // 2. Find matching payment order
    const [order] = await this.db
      .select()
      .from(payment_orders)
      .where(eq(payment_orders.razorpay_order_id, razorpayOrderId))
      .limit(1);

    if (!order) {
      this.logger.warn(`Webhook order not found for razorpay_order_id: ${razorpayOrderId}`);
      return { success: false, message: 'Order not found' };
    }

    // 3. Idempotency Check: if already processed, return 200 OK without double-crediting
    if (order.status === 'PAID') {
      return { success: true, message: 'Order already processed', order_id: order.id };
    }

    // 4. Atomically fulfill payment, record collections and income
    await this.fulfillPayment({
      order,
      razorpayPaymentId: razorpayPaymentId || `pay_wh_${Date.now()}`,
      amountPaid: amountPaid ?? Number(order.amount),
      method: paymentMethod,
      vpa: vpa || null,
      isWebhook: true,
    });

    return { success: true, message: 'Payment fulfilled successfully', order_id: order.id };
  }

  /**
   * Verify payment from client callback (frontend integration verification)
   */
  async verifyPayment(
    mahalId: string,
    userId: string,
    dto: VerifyPaymentDto,
  ): Promise<PaymentVerificationResult> {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    const isMock = dto.razorpay_order_id.startsWith('order_mock_');

    // 1. Verify signature if not mock
    if (!isMock && keySecret) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${dto.razorpay_order_id}|${dto.razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== dto.razorpay_signature) {
        throw new BadRequestException('Invalid payment signature verification failed');
      }
    }

    // 2. Fetch order
    const [order] = await this.db
      .select()
      .from(payment_orders)
      .where(
        and(
          eq(payment_orders.razorpay_order_id, dto.razorpay_order_id),
          eq(payment_orders.mahal_id, mahalId),
        ),
      )
      .limit(1);

    if (!order) {
      throw new NotFoundException('Payment order not found');
    }

    // 3. Idempotency check: if already PAID, return current result
    if (order.status === 'PAID') {
      return {
        success: true,
        message: 'Payment was already processed and verified',
        order_id: order.id,
        razorpay_payment_id: dto.razorpay_payment_id,
        status: 'PAID',
      };
    }

    // 4. Fulfill payment atomically
    const result = await this.fulfillPayment({
      order,
      razorpayPaymentId: dto.razorpay_payment_id,
      amountPaid: Number(order.amount),
      method: 'GATEWAY',
      vpa: null,
      isWebhook: false,
    });

    return {
      success: true,
      message: 'Payment verified and recorded successfully',
      order_id: order.id,
      razorpay_payment_id: dto.razorpay_payment_id,
      status: 'PAID',
      receipt_numbers: result.receipts,
      income_record_id: result.incomeRecordId,
    };
  }

  /**
   * Internal helper to execute atomic settlement of payment order
   */
  private async fulfillPayment(params: {
    order: typeof payment_orders.$inferSelect;
    razorpayPaymentId: string;
    amountPaid: number;
    method: string;
    vpa: string | null;
    isWebhook: boolean;
  }): Promise<{ receipts: string[]; incomeRecordId: string }> {
    const { order, razorpayPaymentId, amountPaid, method, vpa, isWebhook } = params;

    return await this.db.transaction(async (tx) => {
      // 1. Mark order as PAID
      await tx
        .update(payment_orders)
        .set({
          status: 'PAID',
          updated_at: new Date(),
        })
        .where(eq(payment_orders.id, order.id));

      // 2. Insert transaction record
      await tx.insert(payment_transactions).values({
        mahal_id: order.mahal_id,
        payment_order_id: order.id,
        razorpay_payment_id: razorpayPaymentId,
        amount_paid: String(amountPaid),
        method,
        vpa,
        webhook_received_at: isWebhook ? new Date() : null,
        webhook_verified: isWebhook,
      });

      const receipts: string[] = [];

      // 3. If purpose is PIRIVU and months are listed, insert into pirivu_collections
      if (order.purpose === 'PIRIVU' && order.months_covered && order.months_covered.length > 0) {
        const months = order.months_covered;
        const amountPerMonth = (amountPaid / months.length).toFixed(2);

        for (const month of months) {
          const receiptNum = `REC-PIR-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
          receipts.push(receiptNum);

          await tx.insert(pirivu_collections).values({
            mahal_id: order.mahal_id,
            family_id: order.family_id,
            collected_by_user_id: order.user_id,
            amount: amountPerMonth,
            payment_month: month,
            payment_method: 'GATEWAY',
            gateway_payment_id: razorpayPaymentId,
            payment_order_id: order.id,
            receipt_number: receiptNum,
            notes: `Online Pirivu Payment (${razorpayPaymentId})`,
          });
        }
      }

      // 4. Insert into income_records
      const incomeCategory =
        order.purpose === 'PIRIVU'
          ? 'PIRIVU'
          : order.purpose === 'MADRASA_FEE'
          ? 'MADRASA_FEES'
          : 'DONATION';

      const fundType = order.purpose === 'MADRASA_FEE' ? 'MADRASA' : 'GENERAL';

      const [incomeRec] = await tx
        .insert(income_records)
        .values({
          mahal_id: order.mahal_id,
          category: incomeCategory,
          fund_type: fundType,
          amount: String(amountPaid),
          payment_date: new Date().toISOString().split('T')[0],
          description: `Online Payment via Gateway (${order.purpose}) - Order: ${order.razorpay_order_id}`,
          description_ml: `ഓൺലൈൻ പേയ്‌മെന്റ് (${order.purpose})`,
          payer_name: null,
          payment_method: 'GATEWAY',
          reference: razorpayPaymentId,
          created_by_user_id: order.user_id,
        })
        .returning();

      return {
        receipts,
        incomeRecordId: incomeRec.id,
      };
    });
  }

  /**
   * Get payment order status and details
   */
  async getOrderStatus(mahalId: string, orderId: string): Promise<PaymentStatusResponse> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    const condition = isUuid
      ? and(eq(payment_orders.id, orderId), eq(payment_orders.mahal_id, mahalId))
      : and(eq(payment_orders.razorpay_order_id, orderId), eq(payment_orders.mahal_id, mahalId));

    const [order] = await this.db.select().from(payment_orders).where(condition).limit(1);

    if (!order) {
      throw new NotFoundException('Payment order not found');
    }

    const [transaction] = await this.db
      .select()
      .from(payment_transactions)
      .where(eq(payment_transactions.payment_order_id, order.id))
      .orderBy(desc(payment_transactions.created_at))
      .limit(1);

    const pirivuRecords = await this.db
      .select({ receipt_number: pirivu_collections.receipt_number })
      .from(pirivu_collections)
      .where(eq(pirivu_collections.payment_order_id, order.id));

    const receipts = pirivuRecords.map((r) => r.receipt_number);

    return {
      order_id: order.id,
      razorpay_order_id: order.razorpay_order_id,
      status: order.status,
      amount: Number(order.amount),
      currency: order.currency,
      purpose: order.purpose,
      months_covered: order.months_covered,
      transaction: transaction ?? null,
      receipts: receipts.length > 0 ? receipts : undefined,
    };
  }

  /**
   * List payment orders for admin or family
   */
  async listOrders(
    mahalId: string,
    filters: PaymentOrderFilterDto,
  ): Promise<{ items: PaymentOrderItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(payment_orders.mahal_id, mahalId)];

    if (filters.family_id) {
      conditions.push(eq(payment_orders.family_id, filters.family_id));
    }
    if (filters.status) {
      conditions.push(eq(payment_orders.status, filters.status));
    }
    if (filters.purpose) {
      conditions.push(eq(payment_orders.purpose, filters.purpose));
    }

    const whereClause = and(...conditions);

    const [{ value: totalCount }] = await this.db
      .select({ value: count() })
      .from(payment_orders)
      .where(whereClause);

    const rows = await this.db
      .select({
        id: payment_orders.id,
        mahal_id: payment_orders.mahal_id,
        family_id: payment_orders.family_id,
        user_id: payment_orders.user_id,
        razorpay_order_id: payment_orders.razorpay_order_id,
        amount: payment_orders.amount,
        currency: payment_orders.currency,
        purpose: payment_orders.purpose,
        months_covered: payment_orders.months_covered,
        status: payment_orders.status,
        created_at: payment_orders.created_at,
        updated_at: payment_orders.updated_at,
        family_number: families.family_number,
        house_name: families.house_name,
        house_name_ml: families.house_name_ml,
        user_name: users.name,
      })
      .from(payment_orders)
      .leftJoin(families, eq(payment_orders.family_id, families.id))
      .leftJoin(users, eq(payment_orders.user_id, users.id))
      .where(whereClause)
      .orderBy(desc(payment_orders.created_at))
      .limit(limit)
      .offset(offset);

    const total = Number(totalCount);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: rows as unknown as PaymentOrderItem[],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
