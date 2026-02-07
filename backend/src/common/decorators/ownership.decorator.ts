import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_KEY = 'ownership';
export interface OwnershipMetadata {
  entity: string; // table name
  idParam: string; // route param name containing resource id
  ownerField: string; // column name that identifies the owner (e.g., 'created_by', 'patient_id')
}

export const Ownership = (meta: OwnershipMetadata) => SetMetadata(OWNERSHIP_KEY, meta);
