import { OmitType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class SystemAdminDto{
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({
        type: String,
        example: "comp1@facetrack.com",
        required: true
    })
    email: string;

    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: "12345678",
        required: true
    })
    password: string;
}
