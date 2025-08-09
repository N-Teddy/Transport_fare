import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from './config/database.typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { GeographyModule } from './modules/geography/geography.module';
import { DriverModule } from './modules/driver/driver.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { DocumentPhotoModule } from './modules/document-photo/document-photo.module';
import { MeterModule } from './modules/meter/meter.module';
import { FareModule } from './modules/fare/fare.module';
import { SeedModule } from './seed/seed.module';
import { TripModule } from './modules/trip/trip.module';
import { PaymentModule } from './modules/payment/payment.module';
import { TaxModule } from './modules/tax/tax.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuditSubscriber } from './common/subscribers/audit.subscriber';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            useFactory: Configuration,
            inject: [ConfigService],
        }),
        SeedModule,
        AuthModule,
        UserModule,
        GeographyModule,
        DriverModule,
        VehicleModule,
        DocumentPhotoModule,
        MeterModule,
        FareModule,
        TripModule,
        PaymentModule,
        TaxModule,
        AuditModule,
    ],
    controllers: [AppController],
    providers: [AppService, AuditSubscriber],
})
export class AppModule {}
