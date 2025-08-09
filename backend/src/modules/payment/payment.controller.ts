import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('payment')
@ApiBearerAuth('access-token')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}
}
