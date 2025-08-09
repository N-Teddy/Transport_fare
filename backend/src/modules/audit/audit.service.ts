import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { CreateAuditLogDto, AuditLogQueryDto } from '../../dto/request/audit.dto';
import { AuditLogResponseDto } from '../../dto/response/audit.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditRepo: Repository<AuditLog>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async createAuditLog(dto: CreateAuditLogDto): Promise<AuditLogResponseDto> {
        const auditLog = this.auditRepo.create(dto);
        await this.auditRepo.save(auditLog);
        await this.cacheManager.del('audit:list');
        return auditLog as unknown as AuditLogResponseDto;
    }

    async getAuditLogs(
        query: AuditLogQueryDto,
        page = 1,
        limit = 10,
    ): Promise<{ logs: AuditLogResponseDto[]; total: number }> {
        const queryBuilder = this.auditRepo.createQueryBuilder('audit');

        if (query.tableName) {
            queryBuilder.andWhere('audit.tableName = :tableName', { tableName: query.tableName });
        }

        if (query.recordId) {
            queryBuilder.andWhere('audit.recordId = :recordId', { recordId: query.recordId });
        }

        if (query.action) {
            queryBuilder.andWhere('audit.action = :action', { action: query.action });
        }

        if (query.changedBy) {
            queryBuilder.andWhere('audit.changedBy = :changedBy', { changedBy: query.changedBy });
        }

        queryBuilder.orderBy('audit.createdAt', 'DESC');

        const [logs, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            logs: logs as unknown as AuditLogResponseDto[],
            total,
        };
    }

    async getAuditLogById(id: string): Promise<AuditLogResponseDto> {
        const auditLog = await this.auditRepo.findOne({ where: { id } });
        if (!auditLog) {
            throw new Error('Audit log not found');
        }
        return auditLog as unknown as AuditLogResponseDto;
    }
}
