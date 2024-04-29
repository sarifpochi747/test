import { ApiProperty } from "@nestjs/swagger";
import { IsString,IsNotEmpty, IsEnum } from "class-validator";
import { Status } from "src/declarations/status";

export class RequestOrganizationDTO{
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "comp1",
        required: true
    })
    name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "123 bankok 10100",
        required: true
    })
    address: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "0123456789",
        required: true
    })
    phone: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "comp1@facetrack.com",
        required: true
    })
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "12345678",
        required: true
    })
    password: string;

    @IsNotEmpty()
    @IsEnum(Status)
    @ApiProperty({
        type: String,
        example:"Active",
        required: true
    })
    status?: Status

    @ApiProperty({
        type: Array<{uniqueColumnName:String}>,
        example:"somename",
        required: true
    })
    uniqueColumn?: {uniqueColumnName:string}[]
}

export class RequestOrganizationUpadateDTO{
    @ApiProperty({
        type: String,
        example: "comp1",
        required: true
    })
    organizationName?: string;

    @ApiProperty({
        type: String,
        example: "123 bankok 10100",
        required: true
    })
    address?: string;

    @ApiProperty({
        type: String,
        example: "0123456789",
        required: true
    })
    phone?: string;

    @ApiProperty({
        type: String,
        example: "comp1@facetrack.com",
        required: true
    })
    email?: string;

    @ApiProperty({
        type: String,
        example:"Active",
        required: true
    })
    status?: Status

    @ApiProperty({
        type: String,
        example: "12345678",
        required: true
    })
    newPassword: string;

    @ApiProperty({
        type: String,
        example: "12345678",
        required: true
    })
    confirmPassword: string;
}



export class changPasswordOrganizationDTO{

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "12345678",
        required: true
    })
    currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "12345678",
        required: true
    })
    newPassword: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "12345678",
        required: true
    })
    confirmPassword: string;
}

export class createUniqColumnDto{
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "5dfde72a-0f03-47d4-95ec-70ccdee428fc",
        required: true
    })
    organizationId: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "roomId",
        required: true
    })
    uniqueColumnName: string;
}


export class updateUniqColumnDto{
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "5dfde72a-0f03-47d4-95ec-70ccdee428fc",
        required: true
    })
    uniqueColumnId: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "roomId",
        required: true
    })
    uniqueColumnName: string;
}