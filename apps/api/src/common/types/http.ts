import type { JwtPayload } from '@maheall/shared';

export interface HttpRequest {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  user?: JwtPayload;
  mahalId?: string;
  cookies?: Record<string, string>;
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
}

export interface HttpReply {
  setCookie(name: string, value: string, options?: Record<string, unknown>): void;
  clearCookie(name: string, options?: Record<string, unknown>): void;
  status(code: number): { send(data: unknown): void };
}
