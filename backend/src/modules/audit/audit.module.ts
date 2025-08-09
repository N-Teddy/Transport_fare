import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditLog } from '../../entities/audit-log.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [CacheModule.register(), TypeOrmModule.forFeature([AuditLog])],
    controllers: [AuditController],
    providers: [AuditService],
    exports: [AuditService], // Export for use in other modules
})
export class AuditModule {}
