import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { HttpRequest } from '../types/http';
import type { JwtPayload } from '@maheall/shared';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<HttpRequest>();
    return request.user;
  },
);
