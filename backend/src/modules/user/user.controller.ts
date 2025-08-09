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
    // Request,
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
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { UserRoleEnum, ApiResponseStatus, ApiResponseMessage } from '../../common/enum/global.enum';
import {
    CreateUserDto,
    UpdateUserDto,
    ChangeUserPasswordDto,
    UserQueryDto,
} from '../../dto/request/user.dto';
import {
    UserResponseDto,
    // UserListResponseDto,
    UserStatsResponseDto,
    UserCreatedResponseDto,
    UserUpdatedResponseDto,
    UserDeletedResponseDto,
    UserPasswordChangedResponseDto,
} from '../../dto/response/user.dto';
import { ApiResponseDto, PaginatedResponseDto } from '../../dto/response/common.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @Roles(UserRoleEnum.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 409, description: 'Username or email already exists' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async create(
        @Body() createUserDto: CreateUserDto,
        // @Request() req,
    ): Promise<ApiResponseDto<UserCreatedResponseDto>> {
        const result = await this.userService.create(createUserDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.USER_CREATED,
            data: result,
        };
    }

    @Get()
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @ApiOperation({ summary: 'Get all users with pagination and filtering' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({
        name: 'username',
        required: false,
        type: String,
        description: 'Search by username',
    })
    @ApiQuery({ name: 'email', required: false, type: String, description: 'Search by email' })
    @ApiQuery({ name: 'role', required: false, enum: UserRoleEnum, description: 'Filter by role' })
    @ApiQuery({
        name: 'regionId',
        required: false,
        type: Number,
        description: 'Filter by region ID',
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        type: 'string',
        enum: ['true', 'false'],
        description: "Filter by active status ('true' or 'false' as string)",
    })
    @ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        type: PaginatedResponseDto,
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAll(@Query() queryDto: UserQueryDto): Promise<PaginatedResponseDto<UserResponseDto>> {
        const result = await this.userService.findAll(queryDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.USERS_FETCHED,
            data: {
                items: result.users,
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
    @ApiOperation({ summary: 'Get user statistics' })
    @ApiResponse({
        status: 200,
        description: 'User statistics retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getStats(): Promise<ApiResponseDto<UserStatsResponseDto>> {
        const result = await this.userService.getStats();
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FETCHED_SUCCESSFULLY,
            data: result,
        };
    }

    @Get(':id')
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'User retrieved successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findOne(@Param('id') id: string): Promise<ApiResponseDto<UserResponseDto>> {
        const result = await this.userService.findOne(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.FETCHED_SUCCESSFULLY,
            data: result,
        };
    }

    @Patch(':id')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Update user' })
    @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'User ID (UUID)' })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        // @Request() req,
    ): Promise<ApiResponseDto<UserUpdatedResponseDto>> {
        const result = await this.userService.update(id, updateUserDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.USER_UPDATED,
            data: result,
        };
    }

    @Patch(':id/change-password')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Change user password' })
    @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'User ID (UUID)' })
    @ApiBody({ type: ChangeUserPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async changePassword(
        @Param('id') id: string,
        @Body() changePasswordDto: ChangeUserPasswordDto,
    ): Promise<ApiResponseDto<UserPasswordChangedResponseDto>> {
        const result = await this.userService.changePassword(id, changePasswordDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.PASSWORD_CHANGED,
            data: result,
        };
    }

    @Patch(':id/toggle-active')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Toggle user active status' })
    @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'User ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'User status toggled successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async toggleActiveStatus(
        @Param('id') id: string,
    ): Promise<ApiResponseDto<UserUpdatedResponseDto>> {
        const result = await this.userService.toggleActiveStatus(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.USER_UPDATED,
            data: result,
        };
    }

    @Delete(':id')
    @Roles(UserRoleEnum.ADMIN)
    @ApiOperation({ summary: 'Delete user' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'User deleted successfully',
        type: ApiResponseDto,
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 400, description: 'Cannot delete admin users' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async remove(@Param('id') id: string): Promise<ApiResponseDto<UserDeletedResponseDto>> {
        const result = await this.userService.remove(id);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.USER_DELETED,
            data: result,
        };
    }
}
