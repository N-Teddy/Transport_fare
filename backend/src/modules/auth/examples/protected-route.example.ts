import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { UserRoleEnum } from '../../../common/enum/global.enum';

@ApiTags('Example Protected Routes')
@Controller('example')
export class ProtectedRouteExample {
    // Route protected with JWT authentication only
    @Get('protected')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Protected route - requires authentication' })
    @ApiResponse({ status: 200, description: 'Access granted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async protectedRoute(@Request() req) {
        return {
            message: 'This is a protected route',
            user: req.user,
        };
    }

    // Route protected with JWT authentication and specific role
    @Get('admin-only')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin only route' })
    @ApiResponse({ status: 200, description: 'Access granted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async adminOnlyRoute(@Request() req) {
        return {
            message: 'This is an admin-only route',
            user: req.user,
        };
    }

    // Route protected with multiple roles
    @Get('government-access')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL, UserRoleEnum.TAX_OFFICER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Government officials access route' })
    @ApiResponse({ status: 200, description: 'Access granted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async governmentAccessRoute(@Request() req) {
        return {
            message: 'This route is accessible by government officials',
            user: req.user,
        };
    }
}

/*
USAGE EXAMPLES:

1. To protect a route with authentication only:
   @UseGuards(JwtAuthGuard)

2. To protect a route with authentication and role-based access:
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRoleEnum.ADMIN)

3. To allow multiple roles:
   @Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)

4. To access user information in protected routes:
   async someMethod(@Request() req) {
     const userId = req.user.userId;
     const userRole = req.user.role;
     // ... your logic
   }

5. Available user roles:
   - UserRoleEnum.ADMIN
   - UserRoleEnum.GOVERNMENT_OFFICIAL
   - UserRoleEnum.DEVELOPER
   - UserRoleEnum.TAX_OFFICER
   - UserRoleEnum.VIEWER
*/
