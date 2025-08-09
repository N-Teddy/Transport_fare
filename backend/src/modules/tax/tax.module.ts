import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxService } from './tax.service';
import { TaxController } from './tax.controller';
import { DriverTaxAccount } from '../../entities/driver-tax-account.entity';
import { Driver } from '../../entities/driver.entity';
import { Trip } from 'src/entities/trip.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [
        CacheModule.register(),
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([DriverTaxAccount, Driver, Trip]),
    ],
    controllers: [TaxController],
    providers: [TaxService],
})
export class TaxModule {}
