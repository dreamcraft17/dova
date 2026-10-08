import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

export type AuditCategory = 'authentication' | 'administration' | 'security' | 'content';
export type AuditLog = {
  id: string;
  actorUserId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  category: AuditCategory;
  method: string;
  path: string;
  resourceId?: string;
  statusCode: number;
  details: Record<string, unknown>;
  createdAt: string;
};

@Injectable()
export class AuditService {
  private readonly memory: AuditLog[] = [];

  constructor(private readonly database: DatabaseService) {}

  async record(input: Omit<AuditLog, 'id' | 'createdAt'> & { ipAddress?: string }) {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: input.action,
      category: input.category,
      method: input.method,
      path: input.path,
      resourceId: input.resourceId,
      statusCode: input.statusCode,
      details: input.details,
      createdAt: new Date().toISOString(),
    };
    this.memory.unshift(log);
    if (this.memory.length > 500) this.memory.length = 500;
    try {
      await this.database.auditSaveLog(log, input.ipAddress);
    } catch (error) {
      console.warn('[Audit] Could not persist audit event:', (error as Error).message);
    }
  }

  async list(search = '', category = ''): Promise<AuditLog[]> {
    const stored = await this.database.auditListLogs(search, category);
    if (this.database.enabled) return stored;
    const query = search.trim().toLowerCase();
    const normalizedCategory = category.trim().toLowerCase();
    return this.memory.filter((log) => {
      const matchesCategory = !normalizedCategory || log.category === normalizedCategory;
      const haystack = `${log.action} ${log.path} ${log.resourceId || ''} ${log.actorName || ''} ${log.actorEmail || ''}`.toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });
  }
}
