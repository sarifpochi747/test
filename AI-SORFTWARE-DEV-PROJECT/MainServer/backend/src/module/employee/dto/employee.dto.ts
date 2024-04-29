import { ApiProperty } from "@nestjs/swagger";
import { IsString,IsNotEmpty, IsIn, IsEnum } from "class-validator";
import { Status } from "src/declarations/status";


export class RequestEmployee {
    
    @ApiProperty({
        type: String,
        example: "af189a1a-9dbb-4abc-982d-0416a85fe484",
        required: true
    })
    employeeId?: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "wisit poonsawat",
        required: true
    })
    name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "0123456789",
        required: true
    })
    phone: string;

    @IsNotEmpty()
    @IsIn(["Man" , "Woman"])
    @ApiProperty({
        type: String,
        example: "Man",
        required: true
    })
    gender: "Man" | "Woman";

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: Date,
        example: "2024-01-29",
        required: true
    })
    birthday: Date;

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
        example: "type : base64",
        required: true
    })
    profileImage:string

    @IsEnum(Status)
    @ApiProperty({
        type: String,
        example:"Active",
    })
    status?: Status

    @ApiProperty({
        type: Array,
        example:"[{ uniqColData: '1001', uniqueColumnId:'string as a uuid' },]",
    })
    uniqueData?: UniqueDataDto[]
}

export class UniqueDataDto {
    uniqColId?:string;
    uniqColName?:string;
    uniqColData: string;
    uniqueDataId?:string;
    uniqueColumn?: {
        uniqColId: string;
        uniqColName: string;
    }
}


export class imgB64Req {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "type : base64",
        required: true
    })
    imgB64:string
}

export class checkImgRes {
    isPass:boolean;
    message?:string;
    imgB64?:string;
}

export class createEmployeeResponseDto {
    employeeId:string;
    uniqueColumnErr:string[];
}