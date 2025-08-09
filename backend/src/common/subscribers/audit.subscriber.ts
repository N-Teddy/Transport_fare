import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import {
    Connection,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
    RemoveEvent,
} from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { ActionEnum } from '../enum/global.enum';

@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface {
    constructor(@InjectConnection() readonly connection: Connection) {
        connection.subscribers.push(this);
    }

    afterInsert(event: InsertEvent<any>) {
        this.logAction(event, ActionEnum.INSERT);
    }

    afterUpdate(event: UpdateEvent<any>) {
        this.logAction(event, ActionEnum.UPDATE);
    }

    afterRemove(event: RemoveEvent<any>) {
        this.logAction(event, ActionEnum.DELETE);
    }

    private async logAction(
        event: InsertEvent<any> | UpdateEvent<any> | RemoveEvent<any>,
        action: string,
    ) {
        if (event.metadata.tableName === 'audit_log') {
            return;
        }

        const auditLog = new AuditLog();
        auditLog.tableName = event.metadata.tableName;

        if (action === ActionEnum.INSERT) {
            auditLog.recordId = event.entity?.id;
            auditLog.newValues = event.entity;
        } else if (action === ActionEnum.UPDATE) {
            const updateEvent = event as UpdateEvent<any>;
            auditLog.recordId = updateEvent.entity?.id || updateEvent.databaseEntity?.id;
            auditLog.oldValues = updateEvent.databaseEntity;
            auditLog.newValues = updateEvent.entity;
        } else if (action === ActionEnum.DELETE) {
            const removeEvent = event as RemoveEvent<any>;
            auditLog.recordId = removeEvent.entity?.id || removeEvent.databaseEntity?.id;
            auditLog.oldValues = removeEvent.databaseEntity;
        } else {
            // If action is not recognized, skip logging
            return;
        }

        auditLog.action = action;

        // Only save if action is set
        if (!auditLog.action) return;

        // You can get user info from request context if needed
        // auditLog.changedBy = getCurrentUserId();
        // auditLog.ipAddress = getCurrentUserIp();
        // auditLog.userAgent = getCurrentUserAgent();

        await this.connection.manager.save(AuditLog, auditLog);
    }
}
