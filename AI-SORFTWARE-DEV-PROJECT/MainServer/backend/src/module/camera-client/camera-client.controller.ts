import { Controller, Body, HttpStatus, Post, Res, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CameraClientService } from './camera-client.service';
import { CameraClientDto, CameraClientLoginDto } from './dto/camera-client.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from "cache-manager";
import * as bcrypt from 'bcryptjs'

@ApiTags('Camera client')
@Controller('')
export class CameraClientController {
    private saltOrRounds = 10;

    constructor(
        private CameraClientService: CameraClientService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    
}
