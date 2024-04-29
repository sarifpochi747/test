import { ApiProperty } from "@nestjs/swagger";
import { IsString,IsNotEmpty, IsIn, IsNumber } from "class-validator";

export class ImageCaptureDTO{

    @IsString()
    @ApiProperty({
        type: String,
        example: "11",
        required:false
    })
    imgCapId?:string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "imgafile",
        required: true
    })
    imgFile:string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "550e8400-e29b-41d4-a716-446655440000",
        required: true
    })
    cameraId:string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        type: Date,
        example: "2024-02-01",
        required: true
    })
    timeStamp:Date; 
}
