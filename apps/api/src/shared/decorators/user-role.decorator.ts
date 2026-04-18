import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const UserRoles = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const roles = request.user?.roles;

    if (!roles || roles.length === 0) {
      throw new UnauthorizedException('User roles not found in request');
    }

    return roles;
  },
);