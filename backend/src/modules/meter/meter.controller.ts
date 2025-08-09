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
    // HttpStatus,
    // HttpCode,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { MeterService } from './meter.service';
import {
    CreateMeterDto,
    UpdateMeterDto,
    MeterQueryDto,
    // AssignMeterToVehicleDto,
    CalibrateMeterDto,
    UpdateMeterStatusDto,
} from 'src/dto/request/meter.dto';
import {
    MeterResponseDto,
    // MeterListResponseDto,
    MeterStatisticsResponseDto,
    MeterAssignmentResponseDto,
    CalibrationResponseDto,
    MeterStatusUpdateResponseDto,
    MeterSearchResponseDto,
} from 'src/dto/response/meter.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
// import { GetUser } from 'src/common/decorator/get-user.decorator';
// import { User } from 'src/entities/user.entity';
import { ApiResponseDto, PaginatedResponseDto } from 'src/dto/response/common.dto';
import { ApiResponseStatus, ApiResponseMessage } from 'src/common/enum/global.enum';

@ApiTags('Meters')
@ApiBearerAuth('access-token')
@Controller('meters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeterController {
    constructor(private readonly meterService: MeterService) {}

    @Post()
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Create a new meter' })
    @ApiResponse({
        status: 201,
        description: 'Meter created successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 409, description: 'Conflict - Meter serial already exists' })
    async create(
        @Body() createMeterDto: CreateMeterDto,
        // @GetUser() user: User,
    ): Promise<ApiResponseDto<MeterResponseDto>> {
        const result = await this.meterService.create(createMeterDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.METER_CREATED,
            data: result,
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all meters with pagination and filtering' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['active', 'maintenance', 'faulty'],
        description: 'Filter by status',
    })
    @ApiQuery({
        name: 'vehicleId',
        required: false,
        type: Number,
        description: 'Filter by vehicle ID',
    })
    @ApiQuery({
        name: 'manufacturer',
        required: false,
        type: String,
        description: 'Filter by manufacturer',
    })
    @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
    @ApiQuery({
        name: 'sortOrder',
        required: false,
        enum: ['ASC', 'DESC'],
        description: 'Sort order',
    })
    @ApiResponse({
        status: 200,
        description: 'Meters retrieved successfully',
        type: PaginatedResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll(@Query() query: MeterQueryDto): Promise<PaginatedResponseDto<any>> {
        const result = await this.meterService.findAll(query);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.METERS_FETCHED,
            data: {
                items: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                    hasNext: result.hasNextPage,
                    hasPrev: result.hasPrevPage,
                },
            },
        };
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get meter statistics' })
    @ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getStatistics(): Promise<ApiResponseDto<MeterStatisticsResponseDto>> {
        const result = await this.meterService.getStatistics();
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.METER_STATS_FETCHED,
            data: result,
        };
    }

    @Get('search')
    @ApiOperation({ summary: 'Search meters by serial, manufacturer, or model' })
    @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query' })
    @ApiResponse({
        status: 200,
        description: 'Search results retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async search(@Query('q') query: string): Promise<ApiResponseDto<MeterSearchResponseDto>> {
        const result = await this.meterService.search(query);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.METER_SEARCH_RESULTS,
            data: result,
        };
    }

    @Get('unassigned')
    @ApiOperation({ summary: 'Get all unassigned meters' })
    @ApiResponse({
        status: 200,
        description: 'Unassigned meters retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getUnassignedMeters(): Promise<ApiResponseDto<MeterResponseDto[]>> {
        const result = await this.meterService.getUnassignedMeters();
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.UNASSIGNED_METERS_FETCHED,
            data: result,
        };
    }

    @Get('calibration-due')
    @ApiOperation({ summary: 'Get meters due for calibration' })
    @ApiQuery({
        name: 'days',
        required: false,
        type: Number,
        description: 'Days ahead to check (default: 30)',
    })
    @ApiResponse({
        status: 200,
        description: 'Meters due for calibration retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getCalibrationDueMeters(
        @Query('days') days: number = 30,
    ): Promise<ApiResponseDto<MeterResponseDto[]>> {
        const result = await this.meterService.getCalibrationDueMeters(days);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.CALIBRATION_DUE_METERS_FETCHED,
            data: result,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get meter by ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Meter ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Meter found', type: ApiResponseDto })
    @ApiResponse({ status: 404, description: 'Meter not found' })
    async findOne(@Param('id') id: string): Promise<ApiResponseDto<MeterResponseDto>> {
        const result = await this.meterService.findOne(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FETCHED_SUCCESSFULLY,
            data: result,
        };
    }

    @Get(':id/with-vehicle')
    @ApiOperation({ summary: 'Get meter with vehicle information' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Meter ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Meter with vehicle found', type: MeterResponseDto })
    @ApiResponse({ status: 404, description: 'Meter not found' })
    async findOneWithVehicle(@Param('id') id: string): Promise<MeterResponseDto> {
        return this.meterService.findOneWithVehicle(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update meter' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Meter ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Meter updated', type: MeterResponseDto })
    @ApiResponse({ status: 404, description: 'Meter not found' })
    async update(
        @Param('id') id: string,
        @Body() updateMeterDto: UpdateMeterDto,
    ): Promise<MeterResponseDto> {
        return this.meterService.update(id, updateMeterDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete meter' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Meter ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Meter deleted' })
    @ApiResponse({ status: 404, description: 'Meter not found' })
    async remove(@Param('id') id: string): Promise<void> {
        return this.meterService.remove(id);
    }

    @Patch(':id/unassign')
    @ApiOperation({ summary: 'Unassign meter from vehicle' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Meter ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'Meter unassigned from vehicle',
        type: MeterAssignmentResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Meter not found' })
    async unassignFromVehicle(@Param('id') id: string): Promise<MeterAssignmentResponseDto> {
        return this.meterService.unassignFromVehicle(id);
    }

    @Post(':id/assign')
    @ApiOperation({ summary: 'Assign meter to vehicle' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Meter ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'Meter assigned to vehicle',
        type: MeterAssignmentResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Meter not found' })
    async assignToVehicle(
        @Param('id') id: string,
        @Body('vehicleId') vehicleId: string,
    ): Promise<MeterAssignmentResponseDto> {
        return this.meterService.assignToVehicle(id, vehicleId);
    }

    @Post(':id/calibrate')
    @ApiOperation({ summary: 'Calibrate meter' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Meter ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Meter calibrated', type: CalibrationResponseDto })
    @ApiResponse({ status: 404, description: 'Meter not found' })
    async calibrate(
        @Param('id') id: string,
        @Body() calibrateDto: CalibrateMeterDto,
    ): Promise<CalibrationResponseDto> {
        return this.meterService.calibrate(id, calibrateDto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update meter status' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Meter ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'Meter status updated',
        type: MeterStatusUpdateResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Meter not found' })
    async updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateMeterStatusDto,
    ): Promise<MeterStatusUpdateResponseDto> {
        return this.meterService.updateStatus(id, updateStatusDto);
    }

    @Get('by-manufacturer/:manufacturer')
    @ApiOperation({ summary: 'Get meters by manufacturer' })
    @ApiParam({ name: 'manufacturer', description: 'Manufacturer name' })
    @ApiResponse({
        status: 200,
        description: 'Meters by manufacturer retrieved successfully',
        type: [MeterResponseDto],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getByManufacturer(
        @Param('manufacturer') manufacturer: string,
    ): Promise<MeterResponseDto[]> {
        return this.meterService.getByManufacturer(manufacturer);
    }

    @Get('by-status/:status')
    @ApiOperation({ summary: 'Get meters by status' })
    @ApiParam({
        name: 'status',
        description: 'Meter status',
        enum: ['active', 'maintenance', 'faulty'],
    })
    @ApiResponse({
        status: 200,
        description: 'Meters by status retrieved successfully',
        type: [MeterResponseDto],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getByStatus(@Param('status') status: string): Promise<MeterResponseDto[]> {
        return this.meterService.getByStatus(status);
    }
}
