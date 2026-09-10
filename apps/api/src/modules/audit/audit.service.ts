import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import { audit_logs } from '../../database/schema';

export interface AuditLogEntry {
  mahal_id: string;
  actor_user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
  ) {}

  async log(entry: AuditLogEntry): Promise<void> {
    if (!entry.mahal_id) return; // Skip if no mahal context

    await this.db.insert(audit_logs).values({
      mahal_id: entry.mahal_id,
      actor_user_id: entry.actor_user_id ?? null,
      action: entry.action,
      resource_type: entry.resource_type ?? null,
      resource_id: entry.resource_id ?? null,
      previous_value: entry.previous_value ?? null,
      new_value: entry.new_value ?? null,
      ip_address: entry.ip_address ?? null,
    });
  }
}