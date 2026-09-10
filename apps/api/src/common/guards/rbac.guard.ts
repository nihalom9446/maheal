import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_PERMISSIONS } from '@maheall/shared';
import type { MahalRole, Permission } from '@maheall/shared';
import type { HttpRequest } from '../types/http';

export const PERMISSIONS_KEY = 'required_permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  Reflect.metadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<HttpRequest>();
    const user = request.user;

    if (!user?.roles || user.roles.length === 0) {
      throw new ForbiddenException('No roles assigned.');
    }

    const userPermissions = new Set<Permission>();
    for (const role of user.roles as MahalRole[]) {
      const perms = ROLE_PERMISSIONS[role] ?? [];
      perms.forEach(p => userPermissions.add(p));
    }

    const hasAll = requiredPermissions.every(p => userPermissions.has(p));

    if (!hasAll) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.'
      );
    }

    return true;
  }
}