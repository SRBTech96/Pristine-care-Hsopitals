import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';
export interface AuditMetadata {
  entityType?: string; // e.g., 'patients'
  idParam?: string; // request.params key containing the entity id
  accessType?: string; // view, download, export
  resourceType?: string;
}

export const Auditable = (meta?: AuditMetadata) => SetMetadata(AUDIT_KEY, meta || {});
