import { Module } from "@nestjs/common";
import { UserModule } from "@/modules/user/user.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { AdminController } from "./admin.controller";
import { AdminUserService } from "./services/admin-user.service";

@Module({
    imports: [UserModule, AuthModule,],
    controllers: [AdminController],
    providers: [AdminUserService],
})

export class AdminModule { }