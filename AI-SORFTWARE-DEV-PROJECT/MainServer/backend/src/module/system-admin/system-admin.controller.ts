import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { SystemAdminService } from './system-admin.service';
import {  ApiOperation, ApiTags } from "@nestjs/swagger";
import { SystemAdminDto } from './dto/system-admin.dto';

@ApiTags('System Admin')
@Controller('')
export class SystemAdminController {

    constructor(
        private systemAdminService: SystemAdminService
    ) { }


    @ApiOperation({ summary: 'Create System admin', description: '' })
    @Post("/register")
    async createSystemAdmin(@Body() reqeustRegister: SystemAdminDto, @Res() res: Response){
        await this.systemAdminService.createSystemAdmin(reqeustRegister);
        res.status(HttpStatus.CREATED).json({
            message: "register success",
            statusCode: HttpStatus.CREATED
        })
    }

}

