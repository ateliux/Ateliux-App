import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { RequestUser } from '../utils/request-user';

type RequestWithUser = Request & { user?: RequestUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user) {
      throw new Error('Current user was requested outside an authenticated route.');
    }

    return request.user;
  },
);
