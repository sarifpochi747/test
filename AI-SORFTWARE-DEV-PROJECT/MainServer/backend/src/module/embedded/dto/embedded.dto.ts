import { ApiProperty } from "@nestjs/swagger";
import { IsString,IsNotEmpty, IsIn } from "class-validator";

export class EmbeddedRequestDTO{

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        // example: "[]",
        required: true
    })
    imgB64:string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "550e8400-e29b-41d4-a716-446655440000",
        required: true
    })
    employeeId:string;


    

}
