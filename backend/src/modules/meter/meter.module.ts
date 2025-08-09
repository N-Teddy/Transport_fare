import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeterService } from './meter.service';
import { MeterController } from './meter.controller';
import { Meter } from 'src/entities/meter.entity';
import { Vehicle } from 'src/entities/vehicle.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [CacheModule.register(), TypeOrmModule.forFeature([Meter, Vehicle])],
    controllers: [MeterController],
    providers: [MeterService],
    exports: [MeterService],
})
export class MeterModule {}
