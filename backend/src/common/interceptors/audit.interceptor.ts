import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_KEY } from '../decorators/audit.decorator';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector, private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.getAllAndOverride<any>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!meta || !user) return next.handle();

    const entityType = meta.entityType;
    const idParam = meta.idParam;
    const accessType = meta.accessType || 'view';
    const resourceType = meta.resourceType || entityType;

    const resourceId = idParam ? req.params?.[idParam] : undefined;

    const start = Date.now();
    return next.handle().pipe(
      tap(async (data) => {
        const duration = Date.now() - start;
        try {
          await this.auditService.logDataAccess({
            userId: user.id,
            patientId: entityType === 'patients' ? resourceId : undefined,
            accessType,
            resourceType,
            resourceId,
            ipAddress: req.ip,
            success: true,
            resultCode: 'OK'
          });
        } catch (e) {
          // swallow—do not break request on audit failure
        }

        try {
          await this.auditService.logAudit({
            entityType,
            entityId: resourceId,
            action: accessType.toUpperCase(),
            actorId: user.id,
            actorRole: user.role || 'UNKNOWN',
            changesSummary: `Accessed resource ${resourceType}/${resourceId} duration=${duration}ms`,
            severity: 'info'
          });
        } catch (e) {
          // swallow
        }
      })
    );
  }
}
