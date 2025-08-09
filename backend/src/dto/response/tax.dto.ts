import { ApiProperty } from '@nestjs/swagger';
import { TaxPaymentStatusEnum } from 'src/common/enum/status.enum';
import { TaxPeriodEnum } from 'src/common/enum/global.enum';

export class TaxAccountDto {
    @ApiProperty()
    driverId: string;

    @ApiProperty({ enum: TaxPeriodEnum })
    taxPeriod: string;

    @ApiProperty()
    periodStart: Date;

    @ApiProperty()
    periodEnd: Date;

    @ApiProperty()
    totalTrips: number;

    @ApiProperty()
    totalRevenue: number;

    @ApiProperty()
    taxRate: number;

    @ApiProperty()
    taxOwed: number;

    @ApiProperty()
    taxPaid: number;

    @ApiProperty()
    paymentDueDate: Date;

    @ApiProperty({ enum: TaxPaymentStatusEnum })
    status: string;
}

export class PayTaxResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ enum: TaxPaymentStatusEnum })
    status: string;

    @ApiProperty()
    taxPaid: number;
}
