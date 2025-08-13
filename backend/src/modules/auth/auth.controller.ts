import {
    Controller,
    Post,
    Get,
    Put,
    Body,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

import {
    LoginDto,
    RegisterDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    ChangePasswordDto,
    RefreshTokenDto,
    VerifyOtpDto,
    DriverLoginDto,
} from '../../dto/request/auth.dto';
import {
    AuthResponseDto,
    TokenResponseDto,
    UserProfileDto,
    PasswordResetResponseDto,
    MessageResponseDto,
} from '../../dto/response/auth.dto';
import { ApiResponseDto } from '../../dto/response/common.dto';
import { ApiResponseStatus, ApiResponseMessage } from '../../common/enum/global.enum';

@ApiTags('Authentication')
// @ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        type: AuthResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(
        @Request() req,
        @Body() loginDto: LoginDto,
    ): Promise<ApiResponseDto<AuthResponseDto>> {
        const result = await this.authService.login(loginDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.LOGIN_SUCCESSFUL,
            data: result,
        };
    }

    @Post('driver/login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Driver login: Step 1 - Request OTP' })
    @ApiBody({ type: DriverLoginDto })
    @ApiResponse({ status: 200, description: 'OTP sent successfully', type: MessageResponseDto })
    @ApiResponse({ status: 404, description: 'Driver not found' })
    async driverLogin(
        @Body() driverLoginDto: DriverLoginDto,
    ): Promise<ApiResponseDto<MessageResponseDto>> {
        const result = await this.authService.driverLogin(driverLoginDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.OTP_SENT,
            data: result,
        };
    }

    @Post('driver/verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Driver login: Step 2 - Verify OTP and get tokens' })
    @ApiBody({ type: VerifyOtpDto })
    @ApiResponse({ status: 200, description: 'Driver login successful', type: AuthResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<ApiResponseDto<AuthResponseDto>> {
        const result = await this.authService.verifyOtpAndLogin(verifyOtpDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.LOGIN_SUCCESSFUL,
            data: result,
        };
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'User registration' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({
        status: 201,
        description: 'Registration successful',
        type: AuthResponseDto,
    })
    @ApiResponse({ status: 409, description: 'Username or email already exists' })
    async register(@Body() registerDto: RegisterDto): Promise<ApiResponseDto<AuthResponseDto>> {
        const result = await this.authService.register(registerDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.USER_CREATED,
            data: result,
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({
        status: 200,
        description: 'Token refreshed successfully',
        type: TokenResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refreshToken(
        @Body() refreshTokenDto: RefreshTokenDto,
    ): Promise<ApiResponseDto<TokenResponseDto>> {
        const result = await this.authService.refreshToken(refreshTokenDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.REFRESH_SUCCESSFUL,
            data: result,
        };
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request password reset' })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Password reset email sent',
        type: PasswordResetResponseDto,
    })
    async forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto,
    ): Promise<ApiResponseDto<PasswordResetResponseDto>> {
        const result = await this.authService.forgotPassword(forgotPasswordDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.PASSWORD_RESET_SENT,
            data: result,
        };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password with token' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Password reset successful',
        type: MessageResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<ApiResponseDto<MessageResponseDto>> {
        const result = await this.authService.resetPassword(resetPasswordDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.PASSWORD_RESET_SUCCESSFUL,
            data: result,
        };
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get user profile' })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved',
        type: UserProfileDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@Request() req): Promise<ApiResponseDto<UserProfileDto>> {
        const result = await this.authService.getProfile(req.user.userId);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.USERS_FETCHED,
            data: result,
        };
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({
        status: 200,
        description: 'Profile updated successfully',
        type: UserProfileDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateProfile(
        @Request() req,
        @Body() updateData: any,
    ): Promise<ApiResponseDto<UserProfileDto>> {
        const result = await this.authService.updateProfile(req.user.userId, updateData);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.USER_UPDATED,
            data: result,
        };
    }

    @Put('change-password')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Change user password' })
    @ApiBody({ type: ChangePasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Current password is incorrect' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async changePassword(
        @Request() req,
        @Body() changePasswordDto: ChangePasswordDto,
    ): Promise<ApiResponseDto<MessageResponseDto>> {
        const result = await this.authService.changePassword(req.user.userId, changePasswordDto);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.PASSWORD_CHANGED,
            data: result,
        };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({
        status: 200,
        description: 'Logout successful',
        type: MessageResponseDto,
    })
    async logout(): Promise<ApiResponseDto<MessageResponseDto>> {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return a success message
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.LOGOUT_SUCCESSFUL,
            data: { message: 'Logout successful' },
        };
    }
}
