import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AdminRole } from '@prisma/client';
import type { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { RequestUser } from '../utils/request-user';

type RequestWithUser = Request & { user?: RequestUser };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return Boolean(user?.adminRole && requiredRoles.includes(user.adminRole));
  }
}
