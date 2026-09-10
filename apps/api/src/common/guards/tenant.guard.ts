import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { HttpRequest } from '../types/http';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<HttpRequest>();
    const user = request.user;

    if (!user?.mahal_id) {
      throw new ForbiddenException(
        'No Mahal context found. Ensure you are authenticated and have a Mahal role.'
      );
    }

    request.mahalId = user.mahal_id;

    return true;
  }
}