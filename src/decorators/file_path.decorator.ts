import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const FilePathDecorator = createParamDecorator(
  (data: number, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.path
      .split('/')
      .slice(2 + (data ?? 0))
      .join('/');
  },
);
