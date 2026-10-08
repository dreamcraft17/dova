import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { AuditCategory, AuditService } from './audit.service';
import { AuthenticatedRequest } from './auth.types';

type AuditRequest = AuthenticatedRequest & Request & {
  route?: { path?: string };
  params: Record<string, string | undefined>;
  ip?: string;
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuditRequest>();
    const path = request.route?.path || request.path || request.originalUrl.split('?')[0];
    if (!this.shouldRecord(path, request.user?.role)) return next.handle();

    const method = request.method.toUpperCase();
    const category = this.categoryFor(path);
    const action = `${method} ${path}`;
    const resourceId = Object.values(request.params || {}).find(Boolean);
    const actor = request.user;
    const details = { queryKeys: Object.keys(request.query || {}) };
    const record = (statusCode: number) => {
      void this.audit.record({
        actorUserId: actor?.id,
        actorName: actor?.fullName,
        actorEmail: actor?.email,
        actorRole: actor?.role,
        action,
        category,
        method,
        path,
        resourceId,
        statusCode,
        details,
        ipAddress: request.ip,
      });
    };

    return next.handle().pipe(
      tap({
        next: () => record(context.switchToHttp().getResponse().statusCode || 200),
        error: (error: { status?: number }) => record(error.status || 500),
      }),
    );
  }

  private shouldRecord(path: string, role?: string) {
    if (path === '/admin/audit-logs') return false;
    return path.startsWith('/admin/') || path.startsWith('/auth/') || (role === 'admin' && path.startsWith('/feedback/'));
  }

  private categoryFor(path: string): AuditCategory {
    if (path.startsWith('/auth/')) return 'authentication';
    if (path.startsWith('/feedback/')) return 'content';
    return 'administration';
  }
}
