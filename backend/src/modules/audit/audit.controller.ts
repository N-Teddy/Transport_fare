import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateAuditLogDto, AuditLogQueryDto } from '../../dto/request/audit.dto';
import { AuditLogResponseDto } from '../../dto/response/audit.dto';
import { ApiResponseDto, PaginatedResponseDto } from '../../dto/response/common.dto';
import { ApiResponseStatus, ApiResponseMessage } from '../../common/enum/global.enum';

@ApiTags('audit')
@ApiBearerAuth('access-token')
@Controller('audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new audit log entry' })
    @ApiResponse({ status: 201, type: AuditLogResponseDto })
    async createAuditLog(
        @Body() dto: CreateAuditLogDto,
    ): Promise<ApiResponseDto<AuditLogResponseDto>> {
        const result = await this.auditService.createAuditLog(dto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.AUDIT_LOG_CREATED,
            data: result,
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get audit logs with filtering and pagination' })
    @ApiQuery({ name: 'tableName', required: false, type: String })
    @ApiQuery({ name: 'recordId', required: false, type: String })
    @ApiQuery({ name: 'action', required: false, type: String })
    @ApiQuery({ name: 'changedBy', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'List of audit logs.' })
    async getAuditLogs(
        @Query() query: AuditLogQueryDto,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ): Promise<PaginatedResponseDto<any>> {
        const result = await this.auditService.getAuditLogs(query, page, limit);
        const totalPages = Math.ceil(result.total / limit);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.AUDIT_LOGS_FETCHED,
            data: {
                items: result.logs,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            },
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get audit log by ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Audit log ID (UUID)' })
    @ApiResponse({ status: 200, type: AuditLogResponseDto })
    async getAuditLogById(@Param('id') id: string): Promise<ApiResponseDto<AuditLogResponseDto>> {
        const result = await this.auditService.getAuditLogById(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.AUDIT_LOG_FETCHED,
            data: result,
        };
    }
}
