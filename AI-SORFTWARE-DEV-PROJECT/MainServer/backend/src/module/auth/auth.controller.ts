import * as bcrypt from 'bcryptjs'
import { Cache } from "cache-manager";
import { Response, Request } from 'express';
import { AppGateway } from 'src/app.gateway';
import { AuthService } from './auth.service';
import { requestLoginDto } from './dto/auth.dto';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SessionData, AuthData } from 'express-session';
import { CameraClientService } from '../camera-client/camera-client.service';
import { CameraClientDto, CameraClientLoginDto } from 'src/module/camera-client/dto/camera-client.dto';
import { Body, Controller, Get, Post, HttpStatus, Session, Res, UnauthorizedException, Inject, Req, InternalServerErrorException, Put } from '@nestjs/common';

@ApiTags('Authentication API')
@Controller('')
export class AuthController {
    private saltOrRounds = 10;

    constructor(
        private AppGateway: AppGateway,
        private authService: AuthService,
        private CameraClientService: CameraClientService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }


    @ApiOperation({ summary: "Check is passed cookie session active", description: '' })
    @Get('/check-session')
    async getSession(@Session() session: SessionData): Promise<AuthData> {
        if (session.user) {
            return session.user;
        }
        throw new UnauthorizedException();
    }

    @ApiOperation({ summary: 'Admin : Login with credential data', description: '' })
    @Post("/admin")
    async loginAdmin(@Body() requestLogin: requestLoginDto, @Res() res: Response, @Session() session: SessionData): Promise<Response> {
        const admin = await this.authService.validateAdmin(requestLogin);
        if (admin) {
            const authData = {
                dataUser: admin,
                isAdmin: true
            } as AuthData

            session.user = authData
            return res.status(HttpStatus.OK).json({
                message: "admin login success",
                statusCode: HttpStatus.OK
            });
        }
        throw new UnauthorizedException()
    }

    @ApiOperation({ summary: 'System Admin : Login with credential data', description: '' })
    @Post("/system-admin")
    async loginSystemAdmin(@Body() requestLogin: requestLoginDto, @Res() res: Response, @Session() session: SessionData): Promise<Response> {
        const systemAdmin = await this.authService.validateSystemAdmin(requestLogin);
        if (systemAdmin) {
            const authData = {
                dataUser: systemAdmin,
                isSystemAdmin: true
            } as AuthData

            session.user = authData
            return res.status(HttpStatus.OK).json({
                message: "systemAdmin login success",
                statusCode: HttpStatus.OK
            });
        }
        throw new UnauthorizedException()
    }

    @ApiOperation({ summary: 'Camera client Authentication', description: '' })
    @Post("/camera-client")
    async cameraAuth(@Body() requestLogin: CameraClientLoginDto, @Res() res: Response): Promise<Response> {

        const camera = await this.CameraClientService.validateCamera(requestLogin);

        if (camera) {

            const d = new Date()
            const accessToken: string = await bcrypt.hash(requestLogin.cameraId + d.getTime(), this.saltOrRounds)
            const checkingAccessToken: CameraClientDto = await this.cacheManager.get(`${requestLogin.cameraId}`)

            if (checkingAccessToken) {
                this.AppGateway.server.emit(checkingAccessToken?.accessToken + '-force-exit')
                await this.cacheManager.del(`${requestLogin.cameraId}`);
            }

            await this.cacheManager.set(`${requestLogin.cameraId}`, {
                accessToken: accessToken,
                organizationId: requestLogin.organizationId
            }, 0);

            return res.status(HttpStatus.OK).json(
                {
                    message: "login success",
                    statusCode: HttpStatus.OK,
                    data: {
                        accessToken: accessToken,
                    }
                });
        }
        throw new UnauthorizedException()
    }

    @ApiOperation({ summary: "destroy session", description: '' })
    @Put('/logout')
    async logout(@Req() request: Request, @Res() res: Response) {
        if (request.session.user) {
            request.session.destroy((err: Error) => {
                if (err) {
                    throw new InternalServerErrorException(err);
                }
                return res.status(HttpStatus.OK).json({
                    message: "logout success",
                    statusCode: HttpStatus.OK
                });
            })
        } else {
            throw new UnauthorizedException("Invalid session");
        }
    }

}