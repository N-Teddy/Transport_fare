import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseStatus, ApiResponseMessage } from '../../common/enum/global.enum';

export class PaginationDto {
    @ApiProperty({ example: 1, description: 'Current page number' })
    page: number;

    @ApiProperty({ example: 10, description: 'Number of items per page' })
    limit: number;

    @ApiProperty({ example: 100, description: 'Total number of items' })
    total: number;

    @ApiProperty({ example: 10, description: 'Total number of pages' })
    totalPages: number;

    @ApiProperty({ example: true, description: 'Whether there is a next page' })
    hasNext: boolean;

    @ApiProperty({ example: false, description: 'Whether there is a previous page' })
    hasPrev: boolean;
}

export class ApiResponseDto<T = any> {
    @ApiProperty({ enum: ApiResponseStatus, example: ApiResponseStatus.SUCCESS })
    status: ApiResponseStatus;

    @ApiProperty({ enum: ApiResponseMessage, example: ApiResponseMessage.FETCHED_SUCCESSFULLY })
    message: ApiResponseMessage;

    @ApiProperty({ description: 'Response data' })
    data: T;
}

export class PaginatedResponseDto<T = any> {
    @ApiProperty({ enum: ApiResponseStatus, example: ApiResponseStatus.SUCCESS })
    status: ApiResponseStatus;

    @ApiProperty({ enum: ApiResponseMessage, example: ApiResponseMessage.FETCHED_SUCCESSFULLY })
    message: ApiResponseMessage;

    @ApiProperty({
        description: 'Response data with pagination',
        type: 'object',
        properties: {
            items: {
                type: 'array',
                items: { type: 'object' },
                description: 'Array of items',
            },
            pagination: {
                type: 'object',
                additionalProperties: true,
            },
        },
    })
    data: {
        items: T[];
        pagination: PaginationDto;
    };
}

export class ErrorResponseDto {
    @ApiProperty({ enum: ApiResponseStatus, example: ApiResponseStatus.ERROR })
    status: ApiResponseStatus;

    @ApiProperty({ enum: ApiResponseMessage, example: ApiResponseMessage.NOT_FOUND })
    message: ApiResponseMessage;

    @ApiProperty({ description: 'Error details', required: false })
    data?: any;
}
