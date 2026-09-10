import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { HttpRequest } from '../types/http';
import { AuditService } from '../../modules/audit/audit.service';

export const AUDIT_ACTION_KEY = 'audit_action';
export interface AuditMeta {
  action: string;
  resourceType?: string;
}

export const AuditLog = (action: string, resourceType?: string) =>
  Reflect.metadata(AUDIT_ACTION_KEY, { action, resourceType } as AuditMeta);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditMeta = this.reflector.getAllAndOverride<AuditMeta | undefined>(
      AUDIT_ACTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!auditMeta) return next.handle();

    const request = context
      .switchToHttp()
      .getRequest<HttpRequest>();

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const rawForwarded = request.headers['x-forwarded-for'];
          const ipAddress = (Array.isArray(rawForwarded) ? rawForwarded[0] : rawForwarded) ?? request.ip;

          await this.auditService.log({
            mahal_id: request.mahalId ?? request.user?.mahal_id ?? '',
            actor_user_id: request.user?.sub,
            action: auditMeta.action,
            resource_type: auditMeta.resourceType,
            resource_id: (responseData as { data?: { id?: string } })?.data?.id,
            ip_address: ipAddress,
          });
        } catch {
          // Audit log failure must never break the main operation
        }
      }),
    );
  }
}