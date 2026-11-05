import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const rawHeader = req.headers['x-request-id'];
    const requestId = (Array.isArray(rawHeader) ? rawHeader[0] : rawHeader) ?? randomUUID();
    (req as any).requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
