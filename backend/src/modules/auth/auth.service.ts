import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    ConflictException,
    // InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import * as bcrypt from 'bcrypt';
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
    TokenResponseDto,
    UserProfileDto,
    AuthResponseDto,
    PasswordResetResponseDto,
    MessageResponseDto,
} from '../../dto/response/auth.dto';
import { UserRoleEnum } from '../../common/enum/global.enum';
import { v4 as uuidv4 } from 'uuid';
import { Driver } from 'src/entities/driver.entity';
import { Otp } from 'src/entities/otp.entity';
import { DriverResponseDto } from 'src/dto/response/driver.dto';

// const africasTalking = require('africastalking');
@Injectable()
export class AuthService {
    // private sms;

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(PasswordResetToken)
        private passwordResetTokenRepository: Repository<PasswordResetToken>,
        @InjectRepository(Driver)
        private driversRepository: Repository<Driver>,
        @InjectRepository(Otp)
        private otpRepository: Repository<Otp>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        // const atApiKey = this.configService.get<string>('AT_API_KEY');
        // const atUsername = this.configService.get<string>('AT_USERNAME');
        // if (!atApiKey || !atUsername) {
        //     console.error("Africa's Talking credentials are not set in the environment variables.");
        // } else {
        //     const at = africasTalking({
        //         apiKey: atApiKey,
        //         username: atUsername,
        //     });
        //     this.sms = at.SMS;
        // }
    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersRepository.findOne({
            where: [{ username }, { email: username }],
        });

        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user);
        const userProfile = this.mapToUserProfile(user);

        return { tokens, user: userProfile };
    }

    /**
     * Driver Login: Step 1 - Send OTP
     * @param driverLoginDto - Contains the driver's phone number
     * @returns A message indicating the OTP has been sent
     */

    removeCountryCode(phoneNumber: string): { phoneNumber: string } {
        // Remove non-digit characters
        const digitsOnly = phoneNumber.replace(/\D/g, '');

        // Remove Cameroon country code if it exists
        if (digitsOnly.startsWith('237')) {
            return { phoneNumber: digitsOnly.slice(3) }; // return 699xxxxxx
        }

        // Return the number as-is if no known country code found
        return { phoneNumber: digitsOnly };
    }

    async driverLogin(driverLoginDto: DriverLoginDto): Promise<MessageResponseDto> {
        const { phoneNumber } = driverLoginDto;
        const { phoneNumber: cleanedPhone } = this.removeCountryCode(phoneNumber);
        const driver = await this.driversRepository.findOne({
            where: { phoneNumber: cleanedPhone },
        });

        if (!driver) {
            throw new NotFoundException('Driver with this phone number not found.');
        }

        // Generate a 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP expires in 5 minutes

        // Save OTP to the database
        const otpEntry = this.otpRepository.create({
            code: otpCode,
            phoneNumber: cleanedPhone,
            expiresAt,
        });
        await this.otpRepository.save(otpEntry);

        // Send OTP via Africa's Talking
        // if (this.sms) {
        //     try {
        //         await this.sms.send({
        //             to: phoneNumber,
        //             message: `Your verification code is: ${otpCode}`,
        //             from: 'Teddy', // Optional: Your Africa's Talking Sender ID
        //         });
        //     } catch (error) {
        //         console.error('SMS sending failed:', error);
        //         throw new InternalServerErrorException('Failed to send verification code.');
        //     }
        // } else {
        //     console.error("Africa's Talking service not initialized. Cannot send OTP.");
        //     throw new InternalServerErrorException('SMS service is not configured.');
        // }

        return { message: `Verification code sent to your phone number. ${otpCode}` };
    }

    /**
     * Driver Login: Step 2 - Verify OTP and Generate Tokens
     * @param verifyOtpDto - Contains the phone number and OTP
     * @returns Authentication tokens and driver profile
     */
    async verifyOtpAndLogin(verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto> {
        const { phoneNumber, otp } = verifyOtpDto;
        const { phoneNumber: cleanedPhone } = this.removeCountryCode(phoneNumber);

        const otpEntry = await this.otpRepository.findOne({
            where: { phoneNumber: cleanedPhone, code: otp },
        });

        if (!otpEntry) {
            throw new BadRequestException('Invalid verification code.');
        }

        if (otpEntry.expiresAt < new Date()) {
            await this.otpRepository.delete(otpEntry.id);
            throw new BadRequestException('Verification code has expired.');
        }

        // ✅ Find driver by phone number
        const driver = await this.driversRepository.findOne({
            where: { phoneNumber: cleanedPhone },
            relations: ['city'], // Include city name if needed
        });

        if (!driver) {
            throw new UnauthorizedException('Driver not found.');
        }

        // ✅ Clean up the used OTP
        await this.otpRepository.delete(otpEntry.id);

        // ✅ Map to driver response DTO
        const driverProfile: DriverResponseDto = {
            id: driver.id,
            licenseNumber: driver.licenseNumber,
            firstName: driver.firstName,
            lastName: driver.lastName,
            phoneNumber: driver.phoneNumber,
            cniNumber: driver.cniNumber,
            birthDate: driver.birthDate,
            address: driver.address,
            cityId: driver.cityId,
            cityName: driver.city?.name || null,
            driverLicenseExpiry: driver.driverLicenseExpiry,
            healthCertificateExpiry: driver.healthCertificateExpiry,
            registrationDate: driver.registrationDate,
            status: driver.status,
            photosVerified: driver.photosVerified,
            lastPhotoUpdate: driver.lastPhotoUpdate,
            createdAt: driver.createdAt,
            updatedAt: driver.updatedAt,
        };

        // ✅ Generate auth tokens for the driver
        const tokens = await this.generateTokens({
            id: driver.id,
            role: UserRoleEnum.DRIVER,
            phone: driver.phoneNumber,
            username: driver.firstName + '-' + driver.lastName,
        });

        return {
            tokens,
            user: driverProfile,
        };
    }

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const existingUser = await this.usersRepository.findOne({
            where: [{ username: registerDto.username }, { email: registerDto.email }],
        });

        if (existingUser) {
            throw new ConflictException('Username or email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = this.usersRepository.create({
            passwordHash: hashedPassword,
            role: registerDto.role || UserRoleEnum.VIEWER,
            username: registerDto.username,
            email: registerDto.email,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            phone: registerDto.phone,
            regionId: registerDto.regionId as string,
        });

        const savedUser = await this.usersRepository.save(user);
        const { passwordHash, ...userWithoutPassword } = savedUser;

        const tokens = await this.generateTokens(userWithoutPassword);
        const userProfile = this.mapToUserProfile(userWithoutPassword);

        return { tokens, user: userProfile };
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
        try {
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            const user = await this.usersRepository.findOne({
                where: { id: payload.userId },
            });

            const driver = await this.driversRepository.findOne({
                where: { id: payload.userId },
            });

            if (!user && !driver) {
                console.log('user mot found');
                throw new UnauthorizedException('User not found');
            }
            const { passwordHash, ...userWithoutPassword } = user;

            return await this.generateTokens(userWithoutPassword);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<PasswordResetResponseDto> {
        const user = await this.usersRepository.findOne({
            where: { email: forgotPasswordDto.email },
        });

        if (!user) {
            return {
                message: 'If the email exists, a password reset link has been sent.',
                tokenSent: true,
            };
        }

        const resetToken = uuidv4();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        const passwordResetToken = this.passwordResetTokenRepository.create({
            token: resetToken,
            userId: user.id,
            expiresAt,
        });

        await this.passwordResetTokenRepository.save(passwordResetToken);

        return {
            message: 'If the email exists, a password reset link has been sent.',
            tokenSent: true,
        };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<MessageResponseDto> {
        const resetToken = await this.passwordResetTokenRepository.findOne({
            where: { token: resetPasswordDto.token },
            relations: ['user'],
        });

        if (!resetToken || !resetToken.user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        if (resetToken.expiresAt < new Date()) {
            throw new BadRequestException('Reset token has expired');
        }

        const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
        await this.usersRepository.update(resetToken.userId, {
            passwordHash: hashedPassword,
        });

        await this.passwordResetTokenRepository.delete(resetToken.id);

        return { message: 'Password has been reset successfully' };
    }

    async changePassword(
        userId: string,
        changePasswordDto: ChangePasswordDto,
    ): Promise<MessageResponseDto> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
            changePasswordDto.currentPassword,
            user.passwordHash,
        );
        if (!isPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
        await this.usersRepository.update(userId, {
            passwordHash: hashedPassword,
        });

        return { message: 'Password changed successfully' };
    }

    async getProfile(userId: string): Promise<UserProfileDto> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return this.mapToUserProfile(user);
    }

    async updateProfile(userId: string, updateData: Partial<User>): Promise<UserProfileDto> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const { passwordHash, role, ...safeUpdateData } = updateData;

        await this.usersRepository.update(userId, safeUpdateData);

        const updatedUser = await this.usersRepository.findOne({
            where: { id: userId },
        });

        return this.mapToUserProfile(updatedUser);
    }

    private async generateTokens(user: any): Promise<TokenResponseDto> {
        console.log('ok');
        const payload = {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: '1d',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            expires_in: 15 * 60,
        };
    }

    private mapToUserProfile(user: any): UserProfileDto {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            regionId: user.regionId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
