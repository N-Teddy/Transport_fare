import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS),
}));
