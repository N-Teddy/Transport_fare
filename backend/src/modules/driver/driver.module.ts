import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { Driver } from '../../entities/driver.entity';
import { DriverRating } from '../../entities/driver-rating.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [CacheModule.register(), TypeOrmModule.forFeature([Driver, DriverRating])],
    controllers: [DriverController],
    providers: [DriverService],
    exports: [DriverService],
})
export class DriverModule {}
