import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DocumentPhotoService } from './document-photo.service';
import { DocumentPhotoController } from './document-photo.controller';
import { DocumentPhoto } from 'src/entities/document-photo.entity';
import { User } from 'src/entities/user.entity';
import { Driver } from 'src/entities/driver.entity';
import { Vehicle } from 'src/entities/vehicle.entity';
import { getQueueConfig } from 'src/config/queue.config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [
        TypeOrmModule.forFeature([DocumentPhoto, User, Driver, Vehicle]),
        RabbitMQModule.forRootAsync({
            useFactory: () => getQueueConfig(),
        }),
        CacheModule.register(),
    ],
    controllers: [DocumentPhotoController],
    providers: [DocumentPhotoService],
    exports: [DocumentPhotoService],
})
export class DocumentPhotoModule {}
