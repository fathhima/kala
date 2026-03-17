import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./services/auth.service";
import { UserModule } from "../user/user.module";
import { JwtService } from "../../shared/jwt/jwt.service";

@Module({
    imports: [UserModule],
    controllers: [AuthController],
    providers: [AuthService,JwtService]
})
export class AuthModule { }