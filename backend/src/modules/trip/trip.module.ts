import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { Trip } from '../../entities/trip.entity';
import { GpsTrackingLog } from '../../entities/gps-tracking-log.entity';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { getQueueConfig } from 'src/config/queue.config';
import { CacheModule } from '@nestjs/cache-manager';
// import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'; // Uncomment if using RabbitMQ directly

@Module({
    imports: [
        TypeOrmModule.forFeature([Trip, GpsTrackingLog]),
        RabbitMQModule.forRootAsync({
            useFactory: () => getQueueConfig(),
        }),
        CacheModule.register(),
    ],
    controllers: [TripController],
    providers: [TripService],
})
export class TripModule {}
