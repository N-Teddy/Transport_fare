import { IsNotEmpty, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PayTaxDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    driverId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    periodStart: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    amount: number;
}

export class DriverTaxQueryDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    driverId: string;
}
