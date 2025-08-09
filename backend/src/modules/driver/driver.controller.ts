import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    // UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { DriverService } from './driver.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { UserRoleEnum, ApiResponseStatus, ApiResponseMessage } from '../../common/enum/global.enum';
import {
    CreateDriverDto,
    UpdateDriverDto,
    DriverQueryDto,
    CreateDriverRatingDto,
    UpdateDriverRatingDto,
    DriverRatingQueryDto,
} from '../../dto/request/driver.dto';
import {
    DriverResponseDto,
    // DriverListResponseDto,
    DriverCreatedResponseDto,
    DriverUpdatedResponseDto,
    DriverDeletedResponseDto,
    DriverRatingResponseDto,
    // DriverRatingListResponseDto,
    DriverRatingCreatedResponseDto,
    DriverRatingUpdatedResponseDto,
    DriverRatingDeletedResponseDto,
    DriverStatsResponseDto,
    DriverRatingStatsResponseDto,
} from '../../dto/response/driver.dto';
import { ApiResponseDto, PaginatedResponseDto } from '../../dto/response/common.dto';

@ApiTags('Driver')
@Controller('drivers')
// @UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
@ApiBearerAuth()
export class DriverController {
    constructor(private readonly driverService: DriverService) {}

    // Driver Endpoints
    @Post()
    // @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new driver' })
    @ApiBody({ type: CreateDriverDto })
    @ApiResponse({
        status: 201,
        description: 'Driver created successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({
        status: 409,
        description: 'Driver with this license number, phone number, or CNI already exists',
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async createDriver(
        @Body() createDriverDto: CreateDriverDto,
    ): Promise<ApiResponseDto<DriverCreatedResponseDto>> {
        const result = await this.driverService.createDriver(createDriverDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_CREATED,
            data: result,
        };
    }

    @Get()
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get all drivers with pagination and filtering' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({
        name: 'licenseNumber',
        required: false,
        type: String,
        description: 'Search by license number',
    })
    @ApiQuery({
        name: 'firstName',
        required: false,
        type: String,
        description: 'Search by first name',
    })
    @ApiQuery({
        name: 'lastName',
        required: false,
        type: String,
        description: 'Search by last name',
    })
    @ApiQuery({
        name: 'phoneNumber',
        required: false,
        type: String,
        description: 'Search by phone number',
    })
    @ApiQuery({
        name: 'cniNumber',
        required: false,
        type: String,
        description: 'Search by CNI number',
    })
    @ApiQuery({
        name: 'cityId',
        required: false,
        type: 'string',
        format: 'uuid',
        description: 'Filter by city ID',
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['active', 'suspended', 'revoked'],
        description: 'Filter by driver status',
    })
    @ApiQuery({
        name: 'photosVerified',
        required: false,
        type: 'string',
        enum: ['true', 'false'],
        description: "Filter by photos verification status ('true' or 'false' as string)",
    })
    @ApiQuery({
        name: 'licenseExpiryStatus',
        required: false,
        enum: ['valid', 'expired', 'expiring_soon'],
        description: 'Filter by license expiry status',
    })
    @ApiQuery({
        name: 'healthCertificateExpiryStatus',
        required: false,
        enum: ['valid', 'expired', 'expiring_soon'],
        description: 'Filter by health certificate expiry status',
    })
    @ApiResponse({
        status: 200,
        description: 'Drivers retrieved successfully',
        type: PaginatedResponseDto,
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAllDrivers(
        @Query() queryDto: DriverQueryDto,
    ): Promise<PaginatedResponseDto<DriverResponseDto>> {
        const result = await this.driverService.findAllDrivers(queryDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVERS_FETCHED,
            data: {
                items: result.drivers,
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

    @Get('stats')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get driver statistics' })
    @ApiResponse({
        status: 200,
        description: 'Driver statistics retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getDriverStats(): Promise<ApiResponseDto<DriverStatsResponseDto>> {
        const result = await this.driverService.getDriverStats();
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_STATS_FETCHED,
            data: result,
        };
    }

    @Get('license/:licenseNumber')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get driver by license number' })
    @ApiParam({ name: 'licenseNumber', type: String, description: 'Driver license number' })
    @ApiResponse({
        status: 200,
        description: 'Driver retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findDriverByLicenseNumber(
        @Param('licenseNumber') licenseNumber: string,
    ): Promise<ApiResponseDto<DriverResponseDto>> {
        const result = await this.driverService.findDriverByLicenseNumber(licenseNumber);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FETCHED_SUCCESSFULLY,
            data: result,
        };
    }

    @Get('phone/:phoneNumber')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get driver by phone number' })
    @ApiParam({ name: 'phoneNumber', type: String, description: 'Driver phone number' })
    @ApiResponse({
        status: 200,
        description: 'Driver retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findDriverByPhoneNumber(
        @Param('phoneNumber') phoneNumber: string,
    ): Promise<ApiResponseDto<DriverResponseDto>> {
        const result = await this.driverService.findDriverByPhoneNumber(phoneNumber);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FETCHED_SUCCESSFULLY,
            data: result,
        };
    }

    @Get(':id')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get driver by ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Driver ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'Driver retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findDriverById(@Param('id') id: string): Promise<ApiResponseDto<DriverResponseDto>> {
        const result = await this.driverService.findDriverById(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FETCHED_SUCCESSFULLY,
            data: result,
        };
    }

    @Patch(':id')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Update driver' })
    @ApiParam({ name: 'id', type: String, description: 'Driver ID' })
    @ApiBody({ type: UpdateDriverDto })
    @ApiResponse({
        status: 200,
        description: 'Driver updated successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    @ApiResponse({
        status: 409,
        description: 'Driver with this license number, phone number, or CNI already exists',
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async updateDriver(
        @Param('id') id: string,
        @Body() updateDriverDto: UpdateDriverDto,
    ): Promise<ApiResponseDto<DriverUpdatedResponseDto>> {
        const result = await this.driverService.updateDriver(id, updateDriverDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_UPDATED,
            data: result,
        };
    }

    @Patch(':id/status')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Update driver status' })
    @ApiParam({ name: 'id', type: String, description: 'Driver ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['active', 'suspended', 'revoked'],
                    description: 'New driver status',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Driver status updated successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async updateDriverStatus(
        @Param('id') id: string,
        @Body('status') status: string,
    ): Promise<ApiResponseDto<DriverUpdatedResponseDto>> {
        const result = await this.driverService.updateDriverStatus(id, status);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_UPDATED,
            data: result,
        };
    }

    @Patch(':id/photos/verify')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @ApiOperation({ summary: 'Verify driver photos' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Driver ID (UUID)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                verified: {
                    type: 'boolean',
                    description: 'Whether photos are verified',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Driver photos verification status updated successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async verifyDriverPhotos(
        @Param('id') id: string,
        @Body('verified') verified: boolean,
    ): Promise<ApiResponseDto<DriverUpdatedResponseDto>> {
        const result = await this.driverService.verifyDriverPhotos(id, verified);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_PHOTOS_VERIFIED,
            data: result,
        };
    }

    @Delete(':id')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Delete driver' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Driver ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'Driver deleted successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    @ApiResponse({
        status: 409,
        description: 'Cannot delete driver with associated trips, vehicles, or tax accounts',
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async deleteDriver(@Param('id') id: string): Promise<ApiResponseDto<DriverDeletedResponseDto>> {
        const result = await this.driverService.deleteDriver(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_DELETED,
            data: result,
        };
    }

    // Driver Rating Endpoints
    @Post('ratings')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new driver rating' })
    @ApiBody({ type: CreateDriverRatingDto })
    @ApiResponse({
        status: 201,
        description: 'Driver rating created successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async createDriverRating(
        @Body() createDriverRatingDto: CreateDriverRatingDto,
    ): Promise<ApiResponseDto<DriverRatingCreatedResponseDto>> {
        const result = await this.driverService.createDriverRating(createDriverRatingDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_RATING_CREATED,
            data: result,
        };
    }

    @Get('ratings')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get all driver ratings with pagination and filtering' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({
        name: 'driverId',
        required: false,
        type: Number,
        description: 'Filter by driver ID',
    })
    @ApiQuery({ name: 'tripId', required: false, type: String, description: 'Filter by trip ID' })
    @ApiQuery({
        name: 'passengerPhone',
        required: false,
        type: String,
        description: 'Filter by passenger phone',
    })
    @ApiQuery({
        name: 'minRating',
        required: false,
        type: Number,
        description: 'Filter by minimum rating',
    })
    @ApiQuery({
        name: 'maxRating',
        required: false,
        type: Number,
        description: 'Filter by maximum rating',
    })
    @ApiQuery({
        name: 'rating',
        required: false,
        type: Number,
        description: 'Filter by specific rating',
    })
    @ApiResponse({
        status: 200,
        description: 'Driver ratings retrieved successfully',
        type: PaginatedResponseDto,
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAllDriverRatings(
        @Query() queryDto: DriverRatingQueryDto,
    ): Promise<PaginatedResponseDto<DriverRatingResponseDto>> {
        const result = await this.driverService.findAllDriverRatings(queryDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_RATINGS_FETCHED,
            data: {
                items: result.ratings,
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

    @Get('ratings/:id')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get driver rating by ID' })
    @ApiParam({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'Driver rating ID (UUID)',
    })
    @ApiResponse({
        status: 200,
        description: 'Driver rating retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver rating not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findDriverRatingById(
        @Param('id') id: string,
    ): Promise<ApiResponseDto<DriverRatingResponseDto>> {
        const result = await this.driverService.findDriverRatingById(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FETCHED_SUCCESSFULLY,
            data: result,
        };
    }

    @Get(':id/ratings')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get all ratings for a specific driver' })
    @ApiParam({ name: 'id', type: String, description: 'Driver ID' })
    @ApiResponse({
        status: 200,
        description: 'Driver ratings retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findDriverRatingsByDriverId(
        @Param('id') driverId: string,
    ): Promise<ApiResponseDto<DriverRatingResponseDto[]>> {
        const result = await this.driverService.findDriverRatingsByDriverId(driverId);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_RATINGS_FETCHED,
            data: result,
        };
    }

    @Get(':id/rating-stats')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get rating statistics for a specific driver' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Driver ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'Driver rating statistics retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getDriverRatingStats(
        @Param('id') driverId: string,
    ): Promise<ApiResponseDto<DriverRatingStatsResponseDto>> {
        const result = await this.driverService.getDriverRatingStats(driverId);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_RATING_STATS_FETCHED,
            data: result,
        };
    }

    @Patch('ratings/:id')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @ApiOperation({ summary: 'Update driver rating' })
    @ApiParam({ name: 'id', type: String, description: 'Driver rating ID' })
    @ApiBody({ type: UpdateDriverRatingDto })
    @ApiResponse({
        status: 200,
        description: 'Driver rating updated successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver rating not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async updateDriverRating(
        @Param('id') id: string,
        @Body() updateDriverRatingDto: UpdateDriverRatingDto,
    ): Promise<ApiResponseDto<DriverRatingUpdatedResponseDto>> {
        const result = await this.driverService.updateDriverRating(id, updateDriverRatingDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_RATING_UPDATED,
            data: result,
        };
    }

    @Delete('ratings/:id')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Delete driver rating' })
    @ApiParam({ name: 'id', type: String, description: 'Driver rating ID' })
    @ApiResponse({
        status: 200,
        description: 'Driver rating deleted successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Driver rating not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async deleteDriverRating(
        @Param('id') id: string,
    ): Promise<ApiResponseDto<DriverRatingDeletedResponseDto>> {
        const result = await this.driverService.deleteDriverRating(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.DRIVER_RATING_DELETED,
            data: result,
        };
    }
}
