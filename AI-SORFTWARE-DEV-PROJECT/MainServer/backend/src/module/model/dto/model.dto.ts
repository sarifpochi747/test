import { ApiProperty } from "@nestjs/swagger";
import { IsString,IsNotEmpty, IsIn } from "class-validator";

export class ModelDTO{




    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example:"modelFile",
        required: true
    })
    modelFile:string;




    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "2024-01-29",
        required: true
    })
    dateInstall:string;


    
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "550e8400-e29b-41d4-a716-446655440000",
        required: true
    })
    organizationId:string;
    
}
