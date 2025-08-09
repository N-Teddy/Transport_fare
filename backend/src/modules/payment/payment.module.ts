import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MobilePayment } from '../../entities/mobile-payment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MobilePayment])],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule {}
