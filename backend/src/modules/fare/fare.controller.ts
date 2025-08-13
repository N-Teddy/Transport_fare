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
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { FareService } from './fare.service';
import {
    CreateFareRateDto,
    UpdateFareRateDto,
    CreateRegionalFareMultiplierDto,
    UpdateRegionalFareMultiplierDto,
    FareCalculationDto,
    FareRateQueryDto,
    RegionalMultiplierQueryDto,
} from 'src/dto/request/fare.dto';
import {
    FareRateResponseDto,
    RegionalFareMultiplierResponseDto,
    FareCalculationResponseDto,
    FareRateListResponseDto,
    RegionalMultiplierListResponseDto,
    FareStatisticsResponseDto,
} from 'src/dto/response/fare.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
// import { GetUser } from 'src/common/decorator/get-user.decorator';
// import { User } from 'src/entities/user.entity';
import { ApiResponseDto, PaginatedResponseDto } from 'src/dto/response/common.dto';
import { ApiResponseStatus, ApiResponseMessage } from 'src/common/enum/global.enum';

@ApiTags('Fares')
@ApiBearerAuth('access-token')
@Controller('fares')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class FareController {
    constructor(private readonly fareService: FareService) {}

    // Fare Rate Management
    @Post('rates')
    @Roles('admin', 'government_official')
    @ApiOperation({ summary: 'Create a new fare rate' })
    @ApiResponse({
        status: 201,
        description: 'Fare rate created successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Vehicle type not found' })
    @ApiResponse({ status: 409, description: 'Conflict - Active fare rate already exists' })
    async createFareRate(
        @Body() createFareRateDto: CreateFareRateDto,
        // @GetUser() user: User,
    ): Promise<ApiResponseDto<FareRateResponseDto>> {
        const result = await this.fareService.createFareRate(createFareRateDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FARE_RATE_CREATED,
            data: result,
        };
    }

    @Get('rates')
    @ApiOperation({ summary: 'Get all fare rates with pagination and filtering' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({
        name: 'vehicleTypeId',
        required: false,
        type: String,
        description: 'Filter by vehicle type ID',
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        type: 'string',
        enum: ['true', 'false'],
        description: "Filter by active status ('true' or 'false' as string)",
    })
    @ApiQuery({
        name: 'effectiveDate',
        required: false,
        type: String,
        description: 'Filter by effective date',
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
        description: 'Fare rates retrieved successfully',
        type: PaginatedResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAllFareRates(@Query() query: FareRateQueryDto): Promise<PaginatedResponseDto<any>> {
        const result = await this.fareService.findAllFareRates(query);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FARE_RATES_FETCHED,
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

    @Get('rates/:id')
    @ApiOperation({ summary: 'Get a fare rate by ID' })
    @ApiParam({ name: 'id', description: 'Fare rate ID (UUID)', type: 'string', format: 'uuid' })
    @ApiResponse({
        status: 200,
        description: 'Fare rate retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Fare rate not found' })
    async findFareRateById(@Param('id') id: string): Promise<ApiResponseDto<FareRateResponseDto>> {
        const result = await this.fareService.findFareRateById(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FARE_RATES_FETCHED,
            data: result,
        };
    }

    @Get('rates/vehicle-type/:vehicleTypeId')
    @ApiOperation({ summary: 'Get active fare rate for a vehicle type' })
    @ApiParam({
        name: 'vehicleTypeId',
        description: 'Vehicle type ID (UUID)',
        type: 'string',
        format: 'uuid',
    })
    @ApiResponse({
        status: 200,
        description: 'Active fare rate retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Active fare rate not found' })
    async findActiveFareRateByVehicleType(
        @Param('vehicleTypeId') vehicleTypeId: string,
    ): Promise<ApiResponseDto<FareRateResponseDto>> {
        const result = await this.fareService.findActiveFareRateByVehicleType(vehicleTypeId);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FARE_RATES_FETCHED,
            data: result,
        };
    }

    @Patch('rates/:id')
    @Roles('admin', 'government_official')
    @ApiOperation({ summary: 'Update a fare rate' })
    @ApiParam({ name: 'id', description: 'Fare rate ID', type: Number })
    @ApiResponse({
        status: 200,
        description: 'Fare rate updated successfully',
        type: FareRateResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Fare rate not found' })
    async updateFareRate(
        @Param('id') id: string,
        @Body() updateFareRateDto: UpdateFareRateDto,
    ): Promise<FareRateResponseDto> {
        return this.fareService.updateFareRate(id, updateFareRateDto);
    }

    @Delete('rates/:id')
    @Roles('admin')
    @ApiOperation({ summary: 'Delete a fare rate' })
    @ApiParam({ name: 'id', description: 'Fare rate ID', type: Number })
    @ApiResponse({ status: 204, description: 'Fare rate deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Fare rate not found' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteFareRate(@Param('id') id: string): Promise<void> {
        return this.fareService.deleteFareRate(id);
    }

    // Regional Fare Multiplier Management
    @Post('regional-multipliers')
    @Roles('admin', 'government_official')
    @ApiOperation({ summary: 'Create a new regional fare multiplier' })
    @ApiResponse({
        status: 201,
        description: 'Regional multiplier created successfully',
        type: RegionalFareMultiplierResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Region not found' })
    @ApiResponse({ status: 409, description: 'Conflict - Active multiplier already exists' })
    async createRegionalMultiplier(
        @Body() createMultiplierDto: CreateRegionalFareMultiplierDto,
        // @GetUser() user: User,
    ): Promise<RegionalFareMultiplierResponseDto> {
        return this.fareService.createRegionalMultiplier(createMultiplierDto);
    }

    @Get('regional-multipliers')
    @ApiOperation({ summary: 'Get all regional multipliers with pagination and filtering' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({
        name: 'regionId',
        required: false,
        type: String,
        description: 'Filter by region ID',
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        type: 'string',
        enum: ['true', 'false'],
        description: "Filter by active status ('true' or 'false' as string)",
    })
    @ApiQuery({
        name: 'effectiveDate',
        required: false,
        type: String,
        description: 'Filter by effective date',
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
        description: 'Regional multipliers retrieved successfully',
        type: RegionalMultiplierListResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAllRegionalMultipliers(
        @Query() query: RegionalMultiplierQueryDto,
    ): Promise<RegionalMultiplierListResponseDto> {
        return this.fareService.findAllRegionalMultipliers(query);
    }

    @Get('regional-multipliers/:id')
    @ApiOperation({ summary: 'Get a regional multiplier by ID' })
    @ApiParam({
        name: 'id',
        description: 'Regional multiplier ID (UUID)',
        type: 'string',
        format: 'uuid',
    })
    @ApiResponse({
        status: 200,
        description: 'Regional multiplier retrieved successfully',
        type: RegionalFareMultiplierResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Regional multiplier not found' })
    async findRegionalMultiplierById(
        @Param('id') id: string,
    ): Promise<RegionalFareMultiplierResponseDto> {
        return this.fareService.findRegionalMultiplierById(id);
    }

    @Get('regional-multipliers/region/:regionId')
    @ApiOperation({ summary: 'Get active regional multiplier for a region' })
    @ApiParam({ name: 'regionId', description: 'Region ID (UUID)', type: 'string', format: 'uuid' })
    @ApiResponse({
        status: 200,
        description: 'Active regional multiplier retrieved successfully',
        type: RegionalFareMultiplierResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Active regional multiplier not found' })
    async findActiveRegionalMultiplierByRegion(
        @Param('regionId') regionId: string,
    ): Promise<RegionalFareMultiplierResponseDto> {
        return this.fareService.findActiveRegionalMultiplierByRegion(regionId);
    }

    @Patch('regional-multipliers/:id')
    @Roles('admin', 'government_official')
    @ApiOperation({ summary: 'Update a regional multiplier' })
    @ApiParam({ name: 'id', description: 'Regional multiplier ID', type: Number })
    @ApiResponse({
        status: 200,
        description: 'Regional multiplier updated successfully',
        type: RegionalFareMultiplierResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Regional multiplier not found' })
    async updateRegionalMultiplier(
        @Param('id') id: string,
        @Body() updateMultiplierDto: UpdateRegionalFareMultiplierDto,
    ): Promise<RegionalFareMultiplierResponseDto> {
        return this.fareService.updateRegionalMultiplier(id, updateMultiplierDto);
    }

    @Delete('regional-multipliers/:id')
    @Roles('admin')
    @ApiOperation({ summary: 'Delete a regional multiplier' })
    @ApiParam({ name: 'id', description: 'Regional multiplier ID', type: Number })
    @ApiResponse({ status: 204, description: 'Regional multiplier deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Regional multiplier not found' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteRegionalMultiplier(@Param('id') id: string): Promise<void> {
        return this.fareService.deleteRegionalMultiplier(id);
    }

    // Fare Calculation
    @Post('calculate')
    @ApiOperation({ summary: 'Calculate fare for a trip' })
    @ApiResponse({
        status: 200,
        description: 'Fare calculated successfully',
        type: FareCalculationResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Active fare rate not found' })
    async calculateFare(
        @Body() calculationDto: FareCalculationDto,
    ): Promise<FareCalculationResponseDto> {
        return this.fareService.calculateFare(calculationDto);
    }

    // Statistics and Reporting
    @Get('statistics')
    @ApiOperation({ summary: 'Get fare statistics and analytics' })
    @ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
        type: FareStatisticsResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getFareStatistics(): Promise<ApiResponseDto<FareStatisticsResponseDto>> {
        const result = await this.fareService.getFareStatistics();
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FARE_STATS_FETCHED,
            data: result,
        };
    }

    // Additional endpoints for convenience
    @Get('rates/active')
    @ApiOperation({ summary: 'Get all active fare rates' })
    @ApiResponse({
        status: 200,
        description: 'Active fare rates retrieved successfully',
        type: [FareRateResponseDto],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getActiveFareRates(): Promise<FareRateResponseDto[]> {
        const result = await this.fareService.findAllFareRates({ isActive: true, limit: 100 });
        return result.data;
    }

    @Get('regional-multipliers/active')
    @ApiOperation({ summary: 'Get all active regional multipliers' })
    @ApiResponse({
        status: 200,
        description: 'Active regional multipliers retrieved successfully',
        type: [RegionalFareMultiplierResponseDto],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getActiveRegionalMultipliers(): Promise<RegionalFareMultiplierResponseDto[]> {
        const result = await this.fareService.findAllRegionalMultipliers({
            isActive: true,
            limit: 100,
        });
        return result.data;
    }

    @Get('regions/:regionId/rates')
    @ApiOperation({ summary: 'Get fare rates by region' })
    @ApiParam({ name: 'regionId', type: 'string', format: 'uuid', description: 'Region ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Fare rates found', type: FareRateListResponseDto })
    @ApiResponse({ status: 404, description: 'Region not found' })
    async getFareRatesByRegion(
        @Param('regionId') regionId: string,
    ): Promise<FareRateListResponseDto> {
        return this.fareService.getFareRatesByRegion(regionId);
    }
}
