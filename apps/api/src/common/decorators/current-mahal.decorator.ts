import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { HttpRequest } from '../types/http';

export const CurrentMahal = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<HttpRequest>();
    return request.mahalId ?? request.user?.mahal_id ?? '';
  },
);
