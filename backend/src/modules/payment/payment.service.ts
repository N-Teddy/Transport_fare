import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobilePayment } from '../../entities/mobile-payment.entity';
import {
    InitiatePaymentDto,
    ConfirmPaymentDto,
    PaymentStatusDto,
} from '../../dto/request/payment.dto';
import { PaymentResultDto, PaymentStatusResponseDto } from '../../dto/response/payment.dto';
import { PayunitClient } from '@payunit/nodejs-sdk';
// import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
// import { EXCHANGE_NAMES, ROUTING_KEYS } from '../../config/queue.config';

@Injectable()
export class PaymentService {
    private payunitClient: PayunitClient;

    constructor(
        @InjectRepository(MobilePayment)
        private readonly paymentRepo: Repository<MobilePayment>,
        // private readonly amqpConnection: AmqpConnection,
    ) {
        this.payunitClient = new PayunitClient({
            baseURL: process.env.PAYUNIT_BASE_URL || 'https://gateway.payunit.net',
            apiKey: process.env.PAYUNIT_API_KEY,
            apiUsername: process.env.PAYUNIT_API_USERNAME,
            apiPassword: process.env.PAYUNIT_API_PASSWORD,
            mode: 'test',
            timeout: 10000,
        });
    }

    async initiatePayment(dto: InitiatePaymentDto): Promise<PaymentResultDto> {
        // Check if payment already exists for this trip
        const existing = await this.paymentRepo.findOne({ where: { tripId: dto.tripId } });
        if (existing) {
            throw new BadRequestException('Payment already initiated for this trip');
        }

        // Generate a unique transaction ID
        const transactionId = `TXN_${Date.now()}`;

        // Call Payunit SDK
        const payment = await this.payunitClient.collections.initiatePayment({
            total_amount: dto.amount,
            currency: dto.currency || 'XAF',
            transaction_id: transactionId,
            return_url: process.env.PAYUNIT_RETURN_URL || 'https://your-site.com/return',
            notify_url: process.env.PAYUNIT_NOTIFY_URL || 'https://your-site.com/webhook',
            payment_country: 'CM',
            pay_with: dto.operator, // e.g., 'CM_MTNMOMO'
            custom_fields: {
                trip_id: dto.tripId,
                payer_phone: dto.payerPhone,
            },
        });

        // Save payment record
        const paymentRecord = this.paymentRepo.create({
            ...dto,
            transactionId,
            status: 'PENDING',
            operatorResponse: payment,
        });
        await this.paymentRepo.save(paymentRecord);

        // Optionally publish payment event to RabbitMQ
        // await this.amqpConnection.publish(EXCHANGE_NAMES.PAYMENT, ROUTING_KEYS.PAYMENT.PROCESS, { ...dto, transactionId });
        return {
            success: true,
            transactionId,
            message: 'Payment initiated',
        };
    }

    async confirmPayment(dto: ConfirmPaymentDto): Promise<PaymentResultDto> {
        const payment = await this.paymentRepo.findOne({
            where: { tripId: dto.tripId, transactionId: dto.transactionId },
        });
        if (!payment) throw new NotFoundException('Payment not found');
        payment.status = 'COMPLETED';
        payment.completedAt = new Date();
        await this.paymentRepo.save(payment);
        // Optionally publish payment success event
        // await this.amqpConnection.publish(EXCHANGE_NAMES.PAYMENT, ROUTING_KEYS.PAYMENT.SUCCESS, { ...dto });
        return { success: true, transactionId: dto.transactionId };
    }

    async getPaymentStatus(dto: PaymentStatusDto): Promise<PaymentStatusResponseDto> {
        const payment = await this.paymentRepo.findOne({ where: { tripId: dto.tripId } });
        if (!payment) throw new NotFoundException('Payment not found');
        return {
            tripId: payment.tripId,
            status: payment.status,
            operator: payment.operator,
            transactionId: payment.transactionId,
            amount: payment.amount,
            payerPhone: payment.payerPhone,
            completedAt: payment.completedAt,
        };
    }
}
