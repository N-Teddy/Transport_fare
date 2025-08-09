import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeographyController } from './geography.controller';
import { GeographyService } from './geography.service';
import { Region } from '../../entities/region.entity';
import { City } from '../../entities/city.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Region, City])],
    controllers: [GeographyController],
    providers: [GeographyService],
    exports: [GeographyService],
})
export class GeographyModule {}
