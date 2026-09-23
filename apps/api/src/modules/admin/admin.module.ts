import { Module } from "@nestjs/common";
import { UserModule } from "@/modules/user/user.module";
import { InstructorModule } from "../instructor/instructor.module";
import { AdminUserController } from "./controllers/admin-user.controller";
import { AdminInstructorController } from "./controllers/admin-instructor.controller";
import { CategoryModule } from "../category/category.module";
import { AdminCategoryController } from "./controllers/admin-category.controller";

@Module({
    imports: [UserModule, CategoryModule, InstructorModule,],
    controllers: [AdminUserController, AdminInstructorController, AdminCategoryController],
    providers: [],
})

export class AdminModule { }