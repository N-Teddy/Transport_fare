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
    HttpStatus,
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
import { VehicleService } from './vehicle.service';
import {
    CreateVehicleDto,
    UpdateVehicleDto,
    VehicleQueryDto,
    CreateVehicleTypeDto,
    UpdateVehicleTypeDto,
    VehicleTypeQueryDto,
    BulkUpdateVehicleStatusDto,
    VehiclePhotoVerificationDto,
} from 'src/dto/request/vehicle.dto';
import {
    VehicleResponseDto,
    // VehicleListResponseDto,
    VehicleTypeResponseDto,
    // VehicleTypeListResponseDto,
    VehicleStatisticsDto,
    VehicleTypeStatisticsDto,
    BulkUpdateResponseDto,
    VehiclePhotoVerificationResponseDto,
    VehicleCreatedResponseDto,
    VehicleTypeCreatedResponseDto,
    VehicleTypeUpdatedResponseDto,
    VehicleUpdatedResponseDto,
} from 'src/dto/response/vehicle.dto';
// import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UserRoleEnum } from 'src/common/enum/global.enum';
import { ApiResponseDto, PaginatedResponseDto } from 'src/dto/response/common.dto';
import { ApiResponseStatus, ApiResponseMessage } from 'src/common/enum/global.enum';
// import { Transform } from 'class-transformer';

@Controller('vehicles')
// @UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags('Vehicles')
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService) {}

    // Vehicle Type Endpoints
    @Post('types')
    // @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Create a new vehicle type' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Vehicle type created successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Vehicle type with this name already exists',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden - Insufficient permissions',
    })
    async createVehicleType(
        @Body() createVehicleTypeDto: CreateVehicleTypeDto,
    ): Promise<ApiResponseDto<VehicleTypeCreatedResponseDto>> {
        const result = await this.vehicleService.createVehicleType(createVehicleTypeDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLE_TYPE_CREATED,
            data: result,
        };
    }

    @Get('types')
    @ApiOperation({ summary: 'Get all vehicle types with pagination and filtering' })
    @ApiQuery({
        name: 'search',
        required: false,
        description: 'Search term for type name or description',
    })
    // @ApiQuery({
    //     name: 'requiresHelmet',
    //     required: false,
    //     description: 'Filter by helmet requirement',

    // })
    @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
    @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field', example: 'typeName' })
    @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order', example: 'ASC' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Vehicle types retrieved successfully',
        type: PaginatedResponseDto,
    })
    async findAllVehicleTypes(
        @Query() query: VehicleTypeQueryDto,
    ): Promise<PaginatedResponseDto<any>> {
        const result = await this.vehicleService.findAllVehicleTypes(query);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLE_TYPES_FETCHED,
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

    @Get('types/:id')
    @ApiOperation({ summary: 'Get vehicle type by ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Vehicle type ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Vehicle type found', type: ApiResponseDto })
    @ApiResponse({ status: 404, description: 'Vehicle type not found' })
    async findVehicleTypeById(
        @Param('id') id: string,
    ): Promise<ApiResponseDto<VehicleTypeResponseDto>> {
        const result = await this.vehicleService.findVehicleTypeById(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FETCHED_SUCCESSFULLY,
            data: result,
        };
    }

    @Patch('types/:id')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Update vehicle type' })
    @ApiParam({ name: 'id', type: String, description: 'Vehicle type ID' })
    @ApiResponse({
        status: 200,
        description: 'Vehicle type updated',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Vehicle type not found' })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Vehicle type with this name already exists',
    })
    async updateVehicleType(
        @Param('id') id: string,
        @Body() updateVehicleTypeDto: UpdateVehicleTypeDto,
    ): Promise<ApiResponseDto<VehicleTypeUpdatedResponseDto>> {
        const result = await this.vehicleService.updateVehicleType(id, updateVehicleTypeDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLE_TYPE_UPDATED,
            data: result,
        };
    }

    @Delete('types/:id')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Delete vehicle type' })
    @ApiParam({ name: 'id', type: String, description: 'Vehicle type ID' })
    @ApiResponse({ status: 200, description: 'Vehicle type deleted', type: ApiResponseDto })
    @ApiResponse({ status: 404, description: 'Vehicle type not found' })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Cannot delete vehicle type with associated vehicles',
    })
    async deleteVehicleType(@Param('id') id: string): Promise<ApiResponseDto<{ id: string }>> {
        await this.vehicleService.deleteVehicleType(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLE_TYPE_DELETED,
            data: { id },
        };
    }

    @Get('types/statistics')
    @ApiOperation({ summary: 'Get vehicle type statistics' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Vehicle type statistics retrieved successfully',
        type: ApiResponseDto,
    })
    async getVehicleTypeStatistics(): Promise<ApiResponseDto<VehicleTypeStatisticsDto>> {
        const result = await this.vehicleService.getVehicleTypeStatistics();
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLE_TYPE_STATISTICS_FETCHED,
            data: result,
        };
    }

    // Vehicle Endpoints
    @Post()
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @ApiOperation({ summary: 'Create a new vehicle' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Vehicle created successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Vehicle with this license plate already exists',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Vehicle type or owner driver not found',
    })
    async createVehicle(
        @Body() createVehicleDto: CreateVehicleDto,
    ): Promise<ApiResponseDto<VehicleCreatedResponseDto>> {
        const result = await this.vehicleService.createVehicle(createVehicleDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLE_CREATED,
            data: result,
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all vehicles with pagination and filtering' })
    @ApiQuery({
        name: 'search',
        required: false,
        description: 'Search term for license plate, make, or model',
    })
    @ApiQuery({ name: 'vehicleTypeId', required: false, description: 'Filter by vehicle type ID' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by vehicle status' })
    @ApiQuery({ name: 'ownerDriverId', required: false, description: 'Filter by owner driver ID' })
    @ApiQuery({
        name: 'photosVerified',
        required: false,
        description: 'Filter by photos verification status',
    })
    @ApiQuery({
        name: 'insuranceStatus',
        required: false,
        description: 'Filter by insurance status (expired/active)',
    })
    @ApiQuery({
        name: 'inspectionStatus',
        required: false,
        description: 'Filter by inspection status (expired/active)',
    })
    @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
    @ApiQuery({
        name: 'sortBy',
        required: false,
        description: 'Sort field',
        example: 'licensePlate',
    })
    @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order', example: 'DESC' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Vehicles retrieved successfully',
        type: PaginatedResponseDto,
    })
    async findAllVehicles(@Query() query: VehicleQueryDto): Promise<PaginatedResponseDto<any>> {
        const result = await this.vehicleService.findAllVehicles(query);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLES_FETCHED,
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
    @ApiOperation({ summary: 'Get vehicle by ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Vehicle ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Vehicle found', type: ApiResponseDto })
    @ApiResponse({ status: 404, description: 'Vehicle not found' })
    async findVehicleById(@Param('id') id: string): Promise<ApiResponseDto<VehicleResponseDto>> {
        const result = await this.vehicleService.findVehicleById(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FETCHED_SUCCESSFULLY,
            data: result,
        };
    }

    @Patch(':id')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @ApiOperation({ summary: 'Update vehicle' })
    @ApiParam({ name: 'id', type: String, description: 'Vehicle ID' })
    @ApiResponse({ status: 200, description: 'Vehicle updated', type: ApiResponseDto })
    @ApiResponse({ status: 404, description: 'Vehicle not found' })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Vehicle with this license plate already exists',
    })
    async updateVehicle(
        @Param('id') id: string,
        @Body() updateVehicleDto: UpdateVehicleDto,
    ): Promise<ApiResponseDto<VehicleUpdatedResponseDto>> {
        const result = await this.vehicleService.updateVehicle(id, updateVehicleDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLE_UPDATED,
            data: result,
        };
    }

    @Delete(':id')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Delete vehicle' })
    @ApiParam({ name: 'id', type: String, description: 'Vehicle ID' })
    @ApiResponse({ status: 200, description: 'Vehicle deleted', type: ApiResponseDto })
    @ApiResponse({ status: 404, description: 'Vehicle not found' })
    async deleteVehicle(@Param('id') id: string): Promise<ApiResponseDto<{ id: string }>> {
        await this.vehicleService.deleteVehicle(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLE_DELETED,
            data: { id },
        };
    }

    @Post('bulk-update-status')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Bulk update vehicle status' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Vehicle statuses updated successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Some vehicle IDs not found',
    })
    async bulkUpdateVehicleStatus(
        @Body() bulkUpdateDto: BulkUpdateVehicleStatusDto,
    ): Promise<ApiResponseDto<BulkUpdateResponseDto>> {
        const result = await this.vehicleService.bulkUpdateVehicleStatus(bulkUpdateDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLE_BULK_STATUS_UPDATED,
            data: result,
        };
    }

    @Patch('photo-verification')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
    @ApiOperation({ summary: 'Update vehicle photo verification status' })
    @ApiResponse({
        status: 200,
        description: 'Vehicle photo verification updated',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Vehicle not found' })
    async updateVehiclePhotoVerification(
        @Body() verificationDto: VehiclePhotoVerificationDto,
    ): Promise<ApiResponseDto<VehiclePhotoVerificationResponseDto>> {
        const result = await this.vehicleService.updateVehiclePhotoVerification(verificationDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLE_PHOTOS_VERIFIED,
            data: result,
        };
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get vehicle statistics' })
    @ApiResponse({
        status: 200,
        description: 'Vehicle statistics retrieved successfully',
        type: ApiResponseDto,
    })
    async getVehicleStatistics(): Promise<ApiResponseDto<VehicleStatisticsDto>> {
        const result = await this.vehicleService.getVehicleStatistics();
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.VEHICLE_STATS_FETCHED,
            data: result,
        };
    }
}
