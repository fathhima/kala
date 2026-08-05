import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./services/auth.service";
import { UserModule } from "../user/user.module";
import { MailerModule } from "@/shared/mailer/mailer.module";
import { RedisModule } from "@/shared/redis/redis.module";
import { GoogleOAuthService } from "./services/google-oauth.service";
import { JwtModule } from "@/shared/jwt/jwt.module";
import { REFRESH_SESSION_REPOSITORY } from "./repositories/interfaces/refresh-session.repository";
import { RedisRefreshSessionRepository } from "./repositories/redis-refresh-session.repository";
import { PENDING_SIGNUP_REPOSITORY } from "./repositories/interfaces/pending-signup.repository";
import { RedisPendingSignupRepository } from "./repositories/redis-pending-signup.repository";
import { PASSWORD_RESET_REPOSITORY } from "./repositories/interfaces/password-reset.repository";
import { RedisPasswordResetRepository } from "./repositories/redis-password-reset.repository";

@Module({
    imports: [UserModule, MailerModule, RedisModule, JwtModule],
    controllers: [AuthController],
    providers: [AuthService, GoogleOAuthService, {
        provide: REFRESH_SESSION_REPOSITORY,
        useClass: RedisRefreshSessionRepository
    }, {
            provide: PENDING_SIGNUP_REPOSITORY,
            useClass: RedisPendingSignupRepository
        }, {
            provide: PASSWORD_RESET_REPOSITORY,
            useClass: RedisPasswordResetRepository
        }],
    exports: [REFRESH_SESSION_REPOSITORY, PENDING_SIGNUP_REPOSITORY, PASSWORD_RESET_REPOSITORY]
})
export class AuthModule { }