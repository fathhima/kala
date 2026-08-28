import { Module } from "@nestjs/common";
import { UserModule } from "@/modules/user/user.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { AdminUserService } from "./services/admin-user.service";
import { InstructorModule } from "../instructor/instructor.module";
import { AdminUserController } from "./controllers/admin-user.controller";
import { AdminInstructorController } from "./controllers/admin-instructor.controller";
import { AdminInstructorService } from "./services/admin-instructor.service";
import { StorageModule } from "@/shared/storage/storage.module";
import { ADMIN_USER_SERVICE } from "./services/interfaces/admin-user.service.interface";
import { ADMIN_INSTRUCTOR_SERVICE } from "./services/interfaces/admin-instructor.service.interface";
import { CategoryModule } from "../category/category.module";
import { AdminCategoryController } from "./controllers/admin-category.controller";
import { AdminCategoryService } from "./services/admin-category.service";
import { ADMIN_CATEGORY_SERVICE } from "./services/interfaces/admin-category.service.interface";

@Module({
    imports: [UserModule, AuthModule, InstructorModule, StorageModule, CategoryModule],
    controllers: [AdminUserController, AdminInstructorController, AdminCategoryController],
    providers: [
        {
            provide: ADMIN_USER_SERVICE,
            useClass: AdminUserService
        },
        {
            provide: ADMIN_INSTRUCTOR_SERVICE,
            useClass: AdminInstructorService
        },
        {
            provide: ADMIN_CATEGORY_SERVICE,
            useClass: AdminCategoryService,
        }
    ],
})

export class AdminModule { }