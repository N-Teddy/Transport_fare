import { IsNotEmpty, IsUUID, IsEnum, IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MobilePaymentOperatorEnum } from '../../common/enum/global.enum';

export class InitiatePaymentDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    tripId: string;

    @ApiProperty({ enum: MobilePaymentOperatorEnum })
    @IsNotEmpty()
    @IsEnum(MobilePaymentOperatorEnum)
    operator: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    payerPhone: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    amount: number;

    @ApiProperty({ required: false, default: 'XAF' })
    @IsOptional()
    @IsString()
    currency?: string = 'XAF';
}

export class ConfirmPaymentDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    tripId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    transactionId: string;
}

export class PaymentStatusDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    tripId: string;
}
