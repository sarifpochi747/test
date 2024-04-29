import { ApiProperty } from "@nestjs/swagger";
import { IsString,IsNotEmpty, IsNumber, IsArray, IsDate } from "class-validator";
import { CreateAlertDetectionDto } from "src/module/facial-alert/dto/facial-alert.dto";

export class CreateDetectionDto{
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
    @IsArray()
    @ApiProperty({
        type: Object,
        example: "[]",
        required: true
    })
    detectionArray:DetectionDto[];
    
    @IsArray()
    @ApiProperty({
        type: Object,
        example: "[]",
        required: true
    })
    alertDetectionArray:CreateAlertDetectionDto[]

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        type: Number,
        example: "1837423674.3647236",
        required: true
    })
    timeStamp:number; //unix time
    
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "higdhgadasjhdjashdjkahjjl",
        required: true
    })
    accessToken:string;

}

export class DetectionDto{


    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: Number,
        example: "123",
        required: true
    })
    detectId?:number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "123",
        required: true
    })
    facePosition:string;

    @ApiProperty({
        type: String,
        example: "[0.515,0.5541...]",
        required: true
    })
    embedding:string;

    @ApiProperty({
        type: String,
        example: "25",
        required: true
    })
    age:string|null;
    
    @ApiProperty({
        type: String,
        example: "Man",
        required: true
    })
    gender:string|null;
    
    
    @ApiProperty({
        type: String,
        example: "sad",
        required: true
    })
    emotion:string|null;
    
    @ApiProperty({
        type: String,
        example: "wisit",
        required:false
    })
    name:string|null;
    
    @ApiProperty({
        type: Number,
        example: "1",
        required:false
    })
    embeddedId:number|null;
    
}

export class DetectionReqDto{
    
    @ApiProperty({
        type: Number,
        example: "happy",
        required:false
    })
    emotion?:string;

    @ApiProperty({
        type: String,
        example: "",
        required:false
    })
    cameraId?:string;

    @ApiProperty({
        type: String,
        example: "base64 image",
        required:false
    })
    image?:string;

    @ApiProperty({
        type: String,
        example: "2023-12-12",
        required:false
    })
    startDate?:string;

    @ApiProperty({
        type: String,
        example: "2023-12-12",
        required:false
    })
    endDate?:string;
  }

  export class EmotionGraphResDto{
    emotion:string;
    number:number;
  }