import { ApiProperty } from '@nestjs/swagger';
import { ActionEnum } from '../../common/enum/global.enum';

export class AuditLogResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ required: false })
    tableName?: string;

    @ApiProperty({ required: false })
    recordId?: string;

    @ApiProperty({ enum: Object.values(ActionEnum) })
    action: string;

    @ApiProperty({ required: false, type: Object })
    oldValues?: any;

    @ApiProperty({ required: false, type: Object })
    newValues?: any;

    @ApiProperty({ required: false })
    changedBy?: string;

    @ApiProperty({ required: false })
    changeReason?: string;

    @ApiProperty({ required: false })
    ipAddress?: string;

    @ApiProperty({ required: false })
    userAgent?: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
