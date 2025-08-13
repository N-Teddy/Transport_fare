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
import { GeographyService } from './geography.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { UserRoleEnum } from '../../common/enum/global.enum';
import {
    CreateRegionDto,
    UpdateRegionDto,
    RegionQueryDto,
    CreateCityDto,
    UpdateCityDto,
    CityQueryDto,
} from '../../dto/request/geography.dto';
import {
    RegionResponseDto,
    RegionListResponseDto,
    RegionCreatedResponseDto,
    RegionUpdatedResponseDto,
    RegionDeletedResponseDto,
    RegionWithCitiesResponseDto,
    CityResponseDto,
    CityListResponseDto,
    CityCreatedResponseDto,
    CityUpdatedResponseDto,
    CityDeletedResponseDto,
    GeographyStatsResponseDto,
} from '../../dto/response/geography.dto';
import { ApiResponseDto, PaginatedResponseDto } from '../../dto/response/common.dto';
import { ApiResponseStatus, ApiResponseMessage } from '../../common/enum/global.enum';

@ApiTags('Geography')
@ApiBearerAuth('access-token')
@Controller('geography')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class GeographyController {
    constructor(private readonly geographyService: GeographyService) {}

    // Region Endpoints
    @Post('regions')
    @Roles(UserRoleEnum.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new region' })
    @ApiBody({ type: CreateRegionDto })
    @ApiResponse({
        status: 201,
        description: 'Region created successfully',
        type: RegionCreatedResponseDto,
    })
    @ApiResponse({ status: 409, description: 'Region with this name or code already exists' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async createRegion(
        @Body() createRegionDto: CreateRegionDto,
    ): Promise<RegionCreatedResponseDto> {
        return this.geographyService.createRegion(createRegionDto);
    }

    @Get('regions')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get all regions with pagination and filtering' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({ name: 'name', required: false, type: String, description: 'Search by region name' })
    @ApiQuery({ name: 'code', required: false, type: String, description: 'Search by region code' })
    @ApiResponse({
        status: 200,
        description: 'Regions retrieved successfully',
        type: RegionListResponseDto,
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAllRegions(@Query() queryDto: RegionQueryDto): Promise<PaginatedResponseDto<any>> {
        const result = await this.geographyService.findAllRegions(queryDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.REGIONS_FETCHED,
            data: {
                items: result.regions,
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

    @Get('regions/:id')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get region by ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Region ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Region found', type: RegionResponseDto })
    @ApiResponse({ status: 404, description: 'Region not found' })
    async findRegionById(@Param('id') id: string): Promise<RegionResponseDto> {
        return this.geographyService.findRegionById(id);
    }

    @Get('regions/:id/cities')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get region with cities' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Region ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'Region with cities found',
        type: RegionWithCitiesResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Region not found' })
    async findRegionWithCities(@Param('id') id: string): Promise<RegionWithCitiesResponseDto> {
        return this.geographyService.findRegionWithCities(id);
    }

    @Patch('regions/:id')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Update region' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Region ID (UUID)' })
    @ApiBody({ type: UpdateRegionDto })
    @ApiResponse({ status: 200, description: 'Region updated', type: RegionUpdatedResponseDto })
    @ApiResponse({ status: 404, description: 'Region not found' })
    @ApiResponse({ status: 409, description: 'Region with this name or code already exists' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async updateRegion(
        @Param('id') id: string,
        @Body() updateRegionDto: UpdateRegionDto,
    ): Promise<RegionUpdatedResponseDto> {
        return this.geographyService.updateRegion(id, updateRegionDto);
    }

    @Delete('regions/:id')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Delete region' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Region ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Region deleted', type: RegionDeletedResponseDto })
    @ApiResponse({ status: 404, description: 'Region not found' })
    @ApiResponse({
        status: 409,
        description: 'Cannot delete region with associated cities or users',
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async deleteRegion(@Param('id') id: string): Promise<RegionDeletedResponseDto> {
        return this.geographyService.deleteRegion(id);
    }

    // City Endpoints
    @Post('cities')
    @Roles(UserRoleEnum.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new city' })
    @ApiBody({ type: CreateCityDto })
    @ApiResponse({
        status: 201,
        description: 'City created successfully',
        type: CityCreatedResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Region not found' })
    @ApiResponse({ status: 409, description: 'City with this name already exists in this region' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async createCity(@Body() createCityDto: CreateCityDto): Promise<CityCreatedResponseDto> {
        return this.geographyService.createCity(createCityDto);
    }

    @Get('cities')
    // @Roles(
    //     UserRoleEnum.ADMIN,
    //     UserRoleEnum.GOVERNMENT_OFFICIAL,
    //     UserRoleEnum.TAX_OFFICER,
    //     UserRoleEnum.VIEWER,
    // )
    @ApiOperation({ summary: 'Get all cities with pagination and filtering' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({ name: 'name', required: false, type: String, description: 'Search by city name' })
    @ApiQuery({
        name: 'regionId',
        required: false,
        type: Number,
        description: 'Filter by region ID',
    })
    @ApiQuery({
        name: 'isMajorCity',
        required: false,
        type: 'string',
        enum: ['true', 'false'],
        description: "Filter by major city status ('true' or 'false' as string)",
    })
    @ApiResponse({
        status: 200,
        description: 'Cities retrieved successfully',
        type: CityListResponseDto,
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAllCities(@Query() queryDto: CityQueryDto): Promise<PaginatedResponseDto<any>> {
        const result = await this.geographyService.findAllCities(queryDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.CITIES_FETCHED,
            data: {
                items: result.cities,
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

    @Get('cities/major')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get all major cities' })
    @ApiResponse({
        status: 200,
        description: 'Major cities retrieved successfully',
        type: [CityResponseDto],
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findMajorCities(): Promise<CityResponseDto[]> {
        return this.geographyService.findMajorCities();
    }

    @Get('cities/:id')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get city by ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'City ID (UUID)' })
    @ApiResponse({ status: 200, description: 'City found', type: CityResponseDto })
    @ApiResponse({ status: 404, description: 'City not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findCityById(@Param('id') id: string): Promise<CityResponseDto> {
        return this.geographyService.findCityById(id);
    }

    @Get('regions/:regionId/cities')
    @Roles(
        UserRoleEnum.ADMIN,
        UserRoleEnum.GOVERNMENT_OFFICIAL,
        UserRoleEnum.TAX_OFFICER,
        UserRoleEnum.VIEWER,
    )
    @ApiOperation({ summary: 'Get cities by region' })
    @ApiParam({ name: 'regionId', type: 'string', format: 'uuid', description: 'Region ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Cities found', type: [CityResponseDto] })
    @ApiResponse({ status: 404, description: 'Region not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findCitiesByRegion(@Param('regionId') regionId: string): Promise<CityResponseDto[]> {
        return this.geographyService.findCitiesByRegion(regionId);
    }

    @Patch('cities/:id')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Update city' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'City ID (UUID)' })
    @ApiBody({ type: UpdateCityDto })
    @ApiResponse({ status: 200, description: 'City updated', type: CityUpdatedResponseDto })
    @ApiResponse({ status: 404, description: 'City not found' })
    @ApiResponse({ status: 409, description: 'City with this name already exists in this region' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async updateCity(
        @Param('id') id: string,
        @Body() updateCityDto: UpdateCityDto,
    ): Promise<CityUpdatedResponseDto> {
        return this.geographyService.updateCity(id, updateCityDto);
    }

    @Delete('cities/:id')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Delete city' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'City ID (UUID)' })
    @ApiResponse({ status: 200, description: 'City deleted', type: CityDeletedResponseDto })
    @ApiResponse({ status: 404, description: 'City not found' })
    @ApiResponse({ status: 409, description: 'Cannot delete city with associated drivers' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async deleteCity(@Param('id') id: string): Promise<CityDeletedResponseDto> {
        return this.geographyService.deleteCity(id);
    }

    // Statistics Endpoints
    @Get('stats')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Get geography statistics' })
    @ApiResponse({
        status: 200,
        description: 'Geography statistics retrieved successfully',
        type: GeographyStatsResponseDto,
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getGeographyStats(): Promise<ApiResponseDto<GeographyStatsResponseDto>> {
        const result = await this.geographyService.getGeographyStats();
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.GEOGRAPHY_STATS_FETCHED,
            data: result,
        };
    }
}
