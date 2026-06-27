import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { RequestUser } from '../../common/utils/request-user';

type RequestWithUser = Request & { user?: RequestUser };

@Injectable()
export class ClientAuthGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const active = await super.canActivate(context);
    if (!active) return false;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.user?.role !== UserRole.CLIENT || !request.user.clientId) {
      throw new ForbiddenException('Client credentials are required.');
    }

    return true;
  }
}
