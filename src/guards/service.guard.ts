import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ServiceGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const { service, authorization } = request.headers;
    if (!service || !authorization) return false;

    // Validate token
    const expectedToken =
      process.env[(service as string).toUpperCase() + '_TOKEN'];
    const token = authorization.split(' ')[1];

    return token === expectedToken;
  }
}
