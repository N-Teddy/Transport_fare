import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    HttpStatus,
    // HttpCode,
    // Res,
    // NotFoundException,
    BadRequestException,
    StreamableFile,
    NotFoundException,
    Res,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// import { Response } from 'express';
import { DocumentPhotoService } from './document-photo.service';
import {
    UploadDocumentDto,
    UploadMultipleDocumentsDto,
    ProcessDocumentDto,
    BatchProcessDocumentsDto,
    VerifyDocumentDto,
    BatchVerifyDocumentsDto,
    DocumentQueryDto,
    UpdateDocumentDto,
    // DeleteDocumentDto,
    BatchDeleteDocumentsDto,
    UpdateProcessingStatusDto,
    ExportDocumentsDto,
    DocumentStatisticsQueryDto,
} from 'src/dto/request/document.dto';
import { ApiResponseDto, PaginatedResponseDto } from '../../dto/response/common.dto';
import {
    DocumentResponseDto,
    // DocumentListResponseDto,
    UploadResponseDto,
    UploadMultipleResponseDto,
    ProcessingResponseDto,
    BatchProcessingResponseDto,
    VerificationResponseDto,
    BatchVerificationResponseDto,
    DocumentStatisticsDto,
    ExportResponseDto,
    QueueStatusResponseDto,
    DocumentDeletedResponseDto,
} from '../../dto/response/document.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UserRoleEnum } from 'src/common/enum/global.enum';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { DocumentPhotoEnum } from 'src/common/enum/document-photo.enum';
import { ApiResponseStatus, ApiResponseMessage } from 'src/common/enum/global.enum';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateResult } from 'typeorm';

@Controller('documents')
// @UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags('Documents')
export class DocumentPhotoController {
    constructor(private readonly documentPhotoService: DocumentPhotoService) {}

    // File Upload Endpoints
    @Post('upload')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.DRIVER,
    )
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload document photo' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                documentType: {
                    type: 'string',
                    enum: Object.values(DocumentPhotoEnum),
                },
                driverId: {
                    type: 'string',
                    format: 'uuid',
                },
                description: {
                    type: 'string',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Document uploaded', type: DocumentResponseDto })
    async uploadDocument(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @GetUser('id') uploadedBy: string,
    ): Promise<UploadResponseDto> {
        const { entityType, entityId, documentType, priority, metadata } = body;

        const uploadDto: UploadDocumentDto = {
            documentType,
            priority: priority ? Number(priority) : undefined,
            metadata: metadata ? JSON.parse(metadata) : undefined,
        };

        return this.documentPhotoService.uploadDocument(
            entityType,
            entityId,
            uploadDto,
            file,
            uploadedBy,
        );
    }

    @Post('upload/multiple')
    @UseInterceptors(FilesInterceptor('files'))
    @ApiOperation({ summary: 'Upload multiple documents' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'Document files to upload',
                },
                entityType: {
                    type: 'string',
                    example: 'driver',
                    description: 'Entity type (driver, vehicle, user)',
                },
                entityId: {
                    type: 'string',
                    format: 'uuid',
                    example: '0d86b3b8-712f-43dc-a640-f17533df547c',
                    description: 'Entity UUID',
                },
                documents: {
                    type: 'string',
                    example: '[{"documentType": "driver_license", "priority": 5}]',
                    description: 'Array of document configurations (JSON string)',
                },
            },
            required: ['files', 'entityType', 'entityId', 'documents'],
        },
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Documents uploaded successfully',
        type: UploadMultipleResponseDto,
    })
    async uploadMultipleDocuments(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: any,
        @GetUser('id') uploadedBy: string,
    ): Promise<UploadMultipleResponseDto> {
        // Manually parse documents from JSON string
        let documents;
        try {
            documents =
                typeof body.documents === 'string' ? JSON.parse(body.documents) : body.documents;
        } catch (err) {
            throw new BadRequestException('Invalid JSON format for "documents" field.', err);
        }

        const uploadDto: UploadMultipleDocumentsDto = {
            entityType: body.entityType,
            entityId: body.entityId,
            documents,
        };

        return this.documentPhotoService.uploadMultipleDocuments(uploadDto, files, uploadedBy);
    }

    // Document Processing Endpoints
    @Post('process')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Process a document' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Document queued for processing',
        type: ProcessingResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Document not found',
    })
    async processDocument(@Body() processDto: ProcessDocumentDto): Promise<ProcessingResponseDto> {
        return this.documentPhotoService.processDocument(processDto);
    }

    // Statistics Endpoints
    @Get('statistics')
    @ApiOperation({ summary: 'Get document statistics' })
    @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type' })
    @ApiQuery({ name: 'fromDate', required: false, description: 'Date range start' })
    @ApiQuery({ name: 'toDate', required: false, description: 'Date range end' })
    @ApiQuery({ name: 'groupBy', required: false, description: 'Group by field' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Document statistics retrieved successfully',
        type: DocumentStatisticsDto,
    })
    async getDocumentStatistics(
        @Query() query: DocumentStatisticsQueryDto,
    ): Promise<DocumentStatisticsDto> {
        return this.documentPhotoService.getDocumentStatistics(query);
    }

    @Post('process/batch')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Process multiple documents' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Documents queued for processing',
        type: BatchProcessingResponseDto,
    })
    async batchProcessDocuments(
        @Body() batchDto: BatchProcessDocumentsDto,
    ): Promise<BatchProcessingResponseDto> {
        return this.documentPhotoService.batchProcessDocuments(batchDto);
    }

    @Patch('process/status')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Update document processing status' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Processing status updated successfully',
    })
    async updateProcessingStatus(
        @Body() updateDto: UpdateProcessingStatusDto,
    ): Promise<UpdateResult> {
        return this.documentPhotoService.updateProcessingStatus(updateDto);
    }

    // Document Verification Endpoints
    @Patch(':id/verify')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @ApiOperation({ summary: 'Verify document' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Document ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Document verified', type: DocumentResponseDto })
    @ApiResponse({ status: 404, description: 'Document not found' })
    async verifyDocument(
        @Param('id') id: string,
        @Body() verifyDto: VerifyDocumentDto,
        @GetUser('id') verifiedBy: string,
    ): Promise<VerificationResponseDto> {
        return this.documentPhotoService.verifyDocument(verifyDto, verifiedBy);
    }

    @Post('verify/batch')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @ApiOperation({ summary: 'Verify multiple documents' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Documents verified successfully',
        type: BatchVerificationResponseDto,
    })
    async batchVerifyDocuments(
        @Body() batchDto: BatchVerifyDocumentsDto,
        @GetUser('id') verifiedBy: string,
    ): Promise<BatchVerificationResponseDto> {
        return this.documentPhotoService.batchVerifyDocuments(batchDto, verifiedBy);
    }

    // Document Query Endpoints
    @Get()
    @ApiOperation({ summary: 'Get all documents with filtering and pagination' })
    @ApiQuery({
        name: 'search',
        required: false,
        description: 'Search term for file name or metadata',
    })
    @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type' })
    @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID' })
    @ApiQuery({ name: 'documentType', required: false, description: 'Filter by document type' })
    @ApiQuery({
        name: 'verificationStatus',
        required: false,
        description: 'Filter by verification status',
    })
    @ApiQuery({
        name: 'verifiedFrom',
        required: false,
        description: 'Filter by verification date range (start)',
    })
    @ApiQuery({
        name: 'verifiedTo',
        required: false,
        description: 'Filter by verification date range (end)',
    })
    @ApiQuery({
        name: 'uploadedFrom',
        required: false,
        description: 'Filter by upload date range (start)',
    })
    @ApiQuery({
        name: 'uploadedTo',
        required: false,
        description: 'Filter by upload date range (end)',
    })
    @ApiQuery({ name: 'verifiedBy', required: false, description: 'Filter by verified by user ID' })
    @ApiQuery({ name: 'uploadedBy', required: false, description: 'Filter by uploaded by user ID' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
    @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field', example: 'createdAt' })
    @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order', example: 'DESC' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Documents retrieved successfully',
        type: PaginatedResponseDto,
    })
    async findAllDocuments(@Query() query: DocumentQueryDto): Promise<PaginatedResponseDto<any>> {
        const result = await this.documentPhotoService.findAllDocuments(query);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DOCUMENTS_FETCHED,
            data: {
                items: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                    hasNext: result.page < result.totalPages,
                    hasPrev: result.page > 1,
                },
            },
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get document by ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Document ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Document found', type: ApiResponseDto })
    @ApiResponse({ status: 404, description: 'Document not found' })
    async findDocumentById(@Param('id') id: string): Promise<ApiResponseDto<DocumentResponseDto>> {
        const result = await this.documentPhotoService.findDocumentById(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DOCUMENTS_FETCHED,
            data: result,
        };
    }

    @Get(':id/download')
    @ApiOperation({ summary: 'Download document file' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Document ID (UUID)' })
    @ApiResponse({ status: 200, description: 'File downloaded' })
    @ApiResponse({ status: 404, description: 'Document not found' })
    async downloadDocument(@Param('id') id: string): Promise<any> {
        return this.documentPhotoService.downloadDocument(id);
    }

    // Document Update Endpoints
    @Patch(':id')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @ApiOperation({ summary: 'Update a document' })
    @ApiParam({ name: 'id', description: 'Document ID', example: 1 })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Document updated successfully',
        type: DocumentResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Document not found',
    })
    async updateDocument(
        @Param('id') id: string,
        @Body() updateDto: UpdateDocumentDto,
    ): Promise<DocumentResponseDto> {
        return this.documentPhotoService.updateDocument(id, updateDto);
    }

    // Document Deletion Endpoints
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @ApiOperation({ summary: 'Delete document' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Document ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Document deleted' })
    @ApiResponse({ status: 404, description: 'Document not found' })
    async deleteDocument(@Param('id') id: string): Promise<DocumentDeletedResponseDto> {
        return this.documentPhotoService.deleteDocument({ documentId: id });
    }

    @Delete('batch')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Delete multiple documents' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Documents deleted successfully',
        type: [DocumentDeletedResponseDto],
    })
    async batchDeleteDocuments(
        @Body() batchDto: BatchDeleteDocumentsDto,
    ): Promise<DocumentDeletedResponseDto[]> {
        return this.documentPhotoService.batchDeleteDocuments(batchDto);
    }

    // Queue Management Endpoints
    @Get('queue/status')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get queue status' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Queue status retrieved successfully',
        type: [QueueStatusResponseDto],
    })
    async getQueueStatus(): Promise<QueueStatusResponseDto[]> {
        return this.documentPhotoService.getQueueStatus();
    }

    // Export Endpoints
    @Post('export')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Export documents' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Export initiated successfully',
        type: ExportResponseDto,
    })
    async exportDocuments(@Body() exportDto: ExportDocumentsDto): Promise<ExportResponseDto> {
        // This would be implemented to handle document exports
        const exportId = `export_${Date.now()}`;
        return {
            exportId,
            format: exportDto.format || 'csv',
            status: 'processing',
            documentCount: 0,
            createdAt: new Date(),
        };
    }

    @Get(':id/file')
    async getDocumentFile(
        @Param('id') id: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        try {
            // Get document from database
            const document = await this.documentPhotoService.findDocumentById(id);

            if (!document) {
                throw new NotFoundException('Document not found');
            }
            // Check if file exists
            if (!fs.existsSync(document.filePath)) {
                throw new NotFoundException('Document file not found on server');
            }
            // Read file
            const file = fs.createReadStream(document.filePath);

            // Set appropriate headers
            res.set({
                'Content-Type': document.mimeType || 'application/octet-stream',
                'Content-Disposition': `inline; filename="${document.fileName}"`,
            });
            return new StreamableFile(file);
        } catch (error) {
            throw new NotFoundException('Unable to retrieve document file');
        }
    }

    @Get(':id/download')
    async downloadDocumentFile(
        @Param('id') id: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        try {
            // Get document from database
            const document = await this.documentPhotoService.findDocumentById(id);

            if (!document) {
                throw new NotFoundException('Document not found');
            }
            // Check if file exists
            if (!fs.existsSync(document.filePath)) {
                throw new NotFoundException('Document file not found on server');
            }
            // Read file
            const file = fs.createReadStream(document.filePath);

            // Set headers for download
            res.set({
                'Content-Type': document.mimeType || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${document.fileName}"`,
            });
            return new StreamableFile(file);
        } catch (error) {
            throw new NotFoundException('Unable to download document file');
        }
    }
}
