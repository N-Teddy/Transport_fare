import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../entities/user.entity';
import { Region } from '../entities/region.entity';
import { City } from 'src/entities/city.entity';
import { FareRate } from 'src/entities/fare-rates.entity';
import { RegionalFareMultiplier } from 'src/entities/regional-fare-rates.entity';
import { Trip } from 'src/entities/trip.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Region, City, FareRate, RegionalFareMultiplier, Trip]),
    ],
    providers: [SeedService],
})
export class SeedModule {}
