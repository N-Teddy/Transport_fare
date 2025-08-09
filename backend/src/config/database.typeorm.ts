import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const Configuration = async (
    ConfigService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
    type: 'postgres',
    host: ConfigService.get('DB_HOST'),
    port: +ConfigService.get('DB_PORT'),
    username: ConfigService.get('DB_USERNAME'),
    password: ConfigService.get('DB_PASSWORD'),
    database: ConfigService.get('DB_NAME'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: ConfigService.get('DB_LOGGING'),
});
