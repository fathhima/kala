import { InstructorApplicationStatus } from '../enums/instructor.enum';

export type AdminInstructorListParams = {
    page: number;
    limit: number;
    status?: InstructorApplicationStatus;
    search?: string;
};