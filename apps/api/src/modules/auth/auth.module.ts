import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./services/auth.service";
import { UserModule } from "../user/user.module";
import { MailerModule } from "@/shared/mailer/mailer.module";
import { RedisModule } from "@/shared/redis/redis.module";
import { JwtModule } from "@nestjs/jwt";
import { GoogleOAuthService } from "./services/google-oauth.service";

@Module({
    imports: [UserModule, MailerModule, RedisModule, JwtModule],
    controllers: [AuthController],
    providers: [AuthService, GoogleOAuthService]
})
export class AuthModule { }