import { ApiProperty } from "@nestjs/swagger";
import { IsString,IsNotEmpty, IsArray, IsNumber } from "class-validator";
import { DetectionDto } from "src/module/detection/dto/detection.dto";

export class CreateAlertDto{

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
        example: "name",
        required: true
    })
    alertName:string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "5dfde72a-0f03-47d4-95ec-70ccdee428fc",
        required: true
    })
    organizationId:string
}

export class CreateAlertDetectionDto{

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        type: Number,
        example: "alertId",
        required: true
    })
    alertId:number;

    @IsString()
    @ApiProperty({
        type: String,
        example: "imgafile",
        required: true
    })
    imgFile?:string;

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
        type: Number,
        example: "1837423674.3647236",
        required: true
    })
    timeStamp:number; //unix time
    
    @IsArray()
    @ApiProperty({
        type: Object,
        example: "[]",
        required: true
    })
    detectionArray:string[];
    
    @IsString()
    @ApiProperty({
        type: String,
        example: "higdhgadasjhdjashdjkahjjl",
        required: true
    })
    accessToken?:string;

    @IsString()
    @ApiProperty({
        type: String,
        example: "",
        required: true
    })
    organizationId?:string;
}