import { AccessTokenPayload } from "../jwt/types/jwt-payload.type";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export { };