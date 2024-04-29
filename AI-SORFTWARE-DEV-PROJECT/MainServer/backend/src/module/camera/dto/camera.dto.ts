import { ApiProperty } from "@nestjs/swagger";
import { IsString,IsNotEmpty, IsIn, IsEnum } from "class-validator";
import { Status } from "src/declarations/status";

export class CameraDto{
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "cam1",
        required: true
    })
    cameraName:string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "i7 ram 8g storage ssd 128",
        required: true
    })
    cameraSpec:string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "",
        required: false
    })
    cameraDetail:string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "2024-01-29",
        required: true
    })
    dateInstall:string;

    @IsNotEmpty()
    @IsEnum(Status)
    @ApiProperty({
        type: String,
        example:"Active",
        required: true
    })
    status:string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "550e8400-e29b-41d4-a716-446655440000",
        required: true
    })
    organizationId:string;
}
export class systemAdminUpdateCameraDto{

    @ApiProperty({
        type: String,
        example: "436a5387-8726-43e5-8da4-d700c3bab19d",
        required: false
    })
    cameraId:string;


    @ApiProperty({
        type: String,
        example: "cam1",
        required: true
    })
    cameraName:string;

    @ApiProperty({
        type: String,
        example: "i7 ram 8g storage ssd 128",
        required: true
    })
    cameraSpec:string;

    @ApiProperty({
        type: String,
        example: "",
        required: false
    })
    cameraDetail:string;

    @ApiProperty({
        type: String,
        example: "2024-01-29",
        required: true
    })
    dateInstall:string;

    @ApiProperty({
        type: String,
        example:"Active",
        required: true
    })
    status?:string;

    @ApiProperty({
        type: String,
        example: "550e8400-e29b-41d4-a716-446655440000",
        required: true
    })
    organizationId?:string;
}


export class AdminUpdateCameraDto{
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "436a5387-8726-43e5-8da4-d700c3bab19d",
        required: true
    })
    cameraId:string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "cam1",
        required: true
    })
    cameraName:string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "cam in the kitchen",
        required: false
    })
    cameraDetail:string;
}
