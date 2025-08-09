import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { TripService } from './trip.service';
import { CreateTripDto, EndTripDto, AddGpsLogDto, AddGpsLogsDto } from '../../dto/request/trip.dto';
import { TripResponseDto, GpsLogResponseDto } from '../../dto/response/trip.dto';
import { ApiResponseDto } from '../../dto/response/common.dto';
import { ApiResponseStatus, ApiResponseMessage } from '../../common/enum/global.enum';

@ApiTags('trip')
@ApiBearerAuth('access-token')
@Controller('trip')
export class TripController {
    constructor(private readonly tripService: TripService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new trip' })
    @ApiResponse({ status: 201, type: TripResponseDto })
    async createTrip(@Body() dto: CreateTripDto): Promise<ApiResponseDto<TripResponseDto>> {
        const result = await this.tripService.createTrip(dto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.TRIP_CREATED,
            data: result,
        };
    }

    @Post('end')
    @ApiOperation({ summary: 'End a trip' })
    @ApiResponse({ status: 200, type: TripResponseDto })
    async endTrip(@Body() dto: EndTripDto): Promise<ApiResponseDto<TripResponseDto>> {
        const result = await this.tripService.endTrip(dto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.TRIP_ENDED,
            data: result,
        };
    }

    // In trip.controller.ts

    @Get()
    @ApiOperation({ summary: 'Get trips with pagination and filtering' })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10)',
    })
    @ApiQuery({
        name: 'driverId',
        required: false,
        type: String,
        description: 'Filter by driver ID',
    })
    @ApiQuery({
        name: 'vehicleId',
        required: false,
        type: String,
        description: 'Filter by vehicle ID',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Filter trips starting after this date (ISO string)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'Filter trips starting before this date (ISO string)',
    })
    @ApiQuery({
        name: 'paymentStatus',
        required: false,
        type: String,
        description: 'Filter by payment status (PENDING, COMPLETED, etc.)',
    })
    @ApiQuery({
        name: 'syncStatus',
        required: false,
        type: String,
        description: 'Filter by sync status (PENDING, SYNCED, etc.)',
    })
    @ApiResponse({ status: 200, type: [TripResponseDto] })
    async getTrips(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('driverId') driverId?: string,
        @Query('vehicleId') vehicleId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('paymentStatus') paymentStatus?: string,
        @Query('syncStatus') syncStatus?: string,
    ): Promise<
        ApiResponseDto<{ items: TripResponseDto[]; total: number; page: number; limit: number }>
    > {
        const filters = {
            driverId,
            vehicleId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            paymentStatus,
            syncStatus,
        };

        const { items, total } = await this.tripService.getTrips(page, limit, filters);

        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.TRIP_FETCHED,
            data: {
                items,
                total,
                page,
                limit,
            },
        };
    }

    @Post('gps')
    @ApiOperation({ summary: 'Add a GPS tracking log to a trip' })
    @ApiResponse({ status: 201, type: GpsLogResponseDto })
    async addGpsLog(@Body() dto: AddGpsLogDto): Promise<ApiResponseDto<GpsLogResponseDto>> {
        const result = await this.tripService.addGpsLog(dto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.GPS_LOG_ADDED,
            data: result,
        };
    }

    @Post('gps/batch')
    @ApiOperation({ summary: 'Add multiple GPS tracking logs to a trip' })
    @ApiResponse({ status: 201, type: [GpsLogResponseDto] })
    async addGpsLogs(@Body() dto: AddGpsLogsDto): Promise<ApiResponseDto<GpsLogResponseDto[]>> {
        const result = await this.tripService.addGpsLogs(dto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.GPS_LOGS_ADDED,
            data: result,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get trip details by ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Trip ID (UUID)' })
    @ApiResponse({ status: 200, type: TripResponseDto })
    async getTrip(@Param('id') id: string): Promise<ApiResponseDto<TripResponseDto>> {
        const result = await this.tripService.getTripById(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.TRIP_FETCHED,
            data: result,
        };
    }

    @Get(':id/gps')
    @ApiOperation({ summary: 'Get all GPS logs for a trip' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Trip ID (UUID)' })
    @ApiResponse({ status: 200, type: [GpsLogResponseDto] })
    async getGpsLogs(@Param('id') id: string): Promise<ApiResponseDto<GpsLogResponseDto[]>> {
        const result = await this.tripService.getGpsLogsByTripId(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.GPS_LOGS_FETCHED,
            data: result,
        };
    }

    @Get('stats/overall')
    @ApiOperation({ summary: 'Get overall trip statistics' })
    @ApiResponse({ status: 200, description: 'Overall trip statistics.' })
    async getTripStats() {
        return this.tripService.getTripStats();
    }

    @Get('stats/driver/:driverId')
    @ApiOperation({ summary: 'Get trip statistics for a driver' })
    @ApiParam({ name: 'driverId', type: 'string', format: 'uuid', description: 'Driver ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Driver trip statistics.' })
    async getDriverTripStats(@Param('driverId') driverId: string) {
        return this.tripService.getDriverTripStats(driverId);
    }

    @Get('stats/vehicle/:vehicleId')
    @ApiOperation({ summary: 'Get trip statistics for a vehicle' })
    @ApiParam({
        name: 'vehicleId',
        type: 'string',
        format: 'uuid',
        description: 'Vehicle ID (UUID)',
    })
    @ApiResponse({ status: 200, description: 'Vehicle trip statistics.' })
    async getVehicleTripStats(@Param('vehicleId') vehicleId: string) {
        return this.tripService.getVehicleTripStats(vehicleId);
    }

    @Get('stats/daily')
    @ApiOperation({ summary: 'Get daily trip statistics for a date range' })
    @ApiQuery({ name: 'startDate', required: true, type: String })
    @ApiQuery({ name: 'endDate', required: true, type: String })
    @ApiResponse({ status: 200, description: 'Daily trip statistics.' })
    async getDailyTripStats(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.tripService.getDailyTripStats(startDate, endDate);
    }
}
