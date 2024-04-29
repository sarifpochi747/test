import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class GreetingDTO {

    @ApiProperty({
        type: Number,
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    greetingId?: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "Hello sawaddee krabb bro",
        required: true
    })
    message: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        example: "Hello sawaddee krabb bro",
        required: true
    })
    emotion:'happy'|'surprise'|'surprise'|'sad'|'fear'|'disgust'|'angry'|'neutral';

    @ApiProperty({
        type: String,
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    organizationId?: string
}
