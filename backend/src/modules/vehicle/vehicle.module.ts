import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { Vehicle } from 'src/entities/vehicle.entity';
import { VehicleType } from 'src/entities/vehicle-type.entity';
import { Driver } from 'src/entities/driver.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [CacheModule.register(), TypeOrmModule.forFeature([Vehicle, VehicleType, Driver])],
    controllers: [VehicleController],
    providers: [VehicleService],
    exports: [VehicleService],
})
export class VehicleModule {}
