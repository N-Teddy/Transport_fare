import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActionEnum } from '../../common/enum/global.enum';

export class CreateAuditLogDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    tableName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    recordId?: string;

    @ApiProperty({ enum: Object.values(ActionEnum) })
    @IsNotEmpty()
    @IsEnum(ActionEnum)
    action: string;

    @ApiProperty({ required: false, type: Object })
    @IsOptional()
    oldValues?: any;

    @ApiProperty({ required: false, type: Object })
    @IsOptional()
    newValues?: any;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    changedBy?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    changeReason?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    ipAddress?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    userAgent?: string;
}

export class AuditLogQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    tableName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    recordId?: string;

    @ApiProperty({ required: false, enum: Object.values(ActionEnum) })
    @IsOptional()
    @IsEnum(ActionEnum)
    action?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    changedBy?: string;
}
