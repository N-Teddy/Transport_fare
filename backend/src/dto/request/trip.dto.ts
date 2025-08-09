import {
    IsNotEmpty,
    IsOptional,
    IsUUID,
    IsNumber,
    IsEnum,
    IsString,
    IsDateString,
    ValidateNested,
    IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethodEnum } from '../../common/enum/global.enum';

export class CreateTripDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    driverId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    vehicleId: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    meterId?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    startTime: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    startLatitude?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    startLongitude?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    dataSource?: string;
}

export class EndTripDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    tripId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    endTime: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    endLatitude?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    endLongitude?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    distanceKm?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    durationMinutes?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    baseFare?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    distanceFare?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    timeFare?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    surcharges?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    totalFare?: number;

    @ApiProperty({ required: false, enum: PaymentMethodEnum })
    @IsOptional()
    @IsEnum(PaymentMethodEnum)
    paymentMethod?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    paymentReference?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    passengerPhone?: string;
}

export class AddGpsLogDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    tripId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    latitude: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    longitude: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    speed?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    heading?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    accuracy?: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    timestamp: Date;
}

export class AddGpsLogsDto {
    @ApiProperty({ type: [AddGpsLogDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AddGpsLogDto)
    logs: AddGpsLogDto[];
}
