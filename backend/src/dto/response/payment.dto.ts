import { ApiProperty } from '@nestjs/swagger';
import { MobilePaymentOperatorEnum } from '../../common/enum/global.enum';
import { MobilePaymentStatusEnum } from 'src/common/enum/status.enum';

export class PaymentResultDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ required: false })
    message?: string;

    @ApiProperty({ required: false })
    transactionId?: string;
}

export class PaymentStatusResponseDto {
    @ApiProperty()
    tripId: string;

    @ApiProperty({ enum: MobilePaymentStatusEnum })
    status: string;

    @ApiProperty({ enum: MobilePaymentOperatorEnum })
    operator: string;

    @ApiProperty({ required: false })
    transactionId?: string;

    @ApiProperty({ required: false })
    amount?: number;

    @ApiProperty({ required: false })
    payerPhone?: string;

    @ApiProperty({ required: false })
    completedAt?: Date;
}
