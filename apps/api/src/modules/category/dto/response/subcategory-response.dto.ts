import { ApiProperty } from "@nestjs/swagger";
import { SubcategoryDto } from "./category-response.dto";
import { SubcategoryEntity } from "../../entities/subcategory.entity";

export class SubcategoryResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: SubcategoryDto })
    data!: SubcategoryDto;

    static fromEntity(message: string, entity: SubcategoryEntity,): SubcategoryResponseDto {
        return {
            success: true,
            message,
            data: SubcategoryDto.fromEntity(entity),
        };
    }
}

export class SubcategoryListResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: [SubcategoryDto] })
    data!: SubcategoryDto[];

    static fromEntities(message: string, entities: SubcategoryEntity[],): SubcategoryListResponseDto {
        return {
            success: true,
            message,
            data: entities.map(SubcategoryDto.fromEntity),
        };
    }
}