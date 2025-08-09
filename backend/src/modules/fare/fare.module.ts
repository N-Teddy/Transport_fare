import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FareService } from './fare.service';
import { FareController } from './fare.controller';
import { FareRate } from 'src/entities/fare-rates.entity';
import { RegionalFareMultiplier } from 'src/entities/regional-fare-rates.entity';
import { VehicleType } from 'src/entities/vehicle-type.entity';
import { Region } from 'src/entities/region.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [
        CacheModule.register(),
        TypeOrmModule.forFeature([FareRate, RegionalFareMultiplier, VehicleType, Region]),
    ],
    controllers: [FareController],
    providers: [FareService],
    exports: [FareService],
})
export class FareModule {}
