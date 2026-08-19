import { Module } from "@nestjs/common";
import { UserModule } from "@/modules/user/user.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { AdminUserService } from "./services/admin-user.service";
import { InstructorModule } from "../instructor/instructor.module";
import { AdminUserController } from "./controllers/admin-user.controller";
import { AdminInstructorController } from "./controllers/admin-instructor.controller";
import { AdminInstructorService } from "./services/admin-instructor.service";
import { StorageModule } from "@/shared/storage/storage.module";

@Module({
    imports: [UserModule, AuthModule,InstructorModule,StorageModule],
    controllers: [AdminUserController,AdminInstructorController],
    providers: [AdminUserService,AdminInstructorService],
})

export class AdminModule { }