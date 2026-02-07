import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNERSHIP_KEY } from '../../common/decorators/ownership.decorator';
import { DataSource } from 'typeorm';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector, private dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const meta = this.reflector.getAllAndOverride<any>(OWNERSHIP_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!meta) return true; // no ownership requirement

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException('Unauthenticated');

    // admins bypass ownership checks
    if (user.role === 'ADMIN') return true;

    const id = req.params?.[meta.idParam];
    if (!id) throw new ForbiddenException('Missing resource identifier');

    // Query the table for the row and owner field
    const qb = this.dataSource.createQueryBuilder().select().from(meta.entity, 't').where('t.id = :id', { id });
    const row = await qb.getRawOne();
    if (!row) throw new ForbiddenException('Resource not found');

    // ownerField can be patient_id, created_by, doctor_id, user_id
    const ownerVal = row[meta.ownerField] || row[meta.ownerField.toLowerCase()];

    // patient users may match via user id
    if (user.role === 'PATIENT' && meta.ownerField === 'user_id') {
      if (ownerVal === user.id) return true;
    }

    // doctor access: check doctor_id
    if (user.role === 'DOCTOR' && ownerVal === user.id) return true;

    // direct owner match
    if (ownerVal === user.id) return true;

    throw new ForbiddenException('Access denied');
  }
}
