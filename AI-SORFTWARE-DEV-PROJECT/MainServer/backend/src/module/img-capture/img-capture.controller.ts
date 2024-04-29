import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Post, Query, UseGuards, Session } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ImgCaptureService } from './img-capture.service';
import { ImageCaptureDTO } from './dto/img-capture.dto';
import { RolesGuard } from 'src/guard/Roles.guard';
import { Role, Roles } from 'src/decorator/roles.decorator';
import { AppGateway } from 'src/app.gateway';
import { SessionData } from 'express-session';

@ApiTags('Image Capture')
@UseGuards(RolesGuard)
@Controller('')
export class ImgCaptureController {

    constructor(
        private AppGateway: AppGateway,
        private imgCaptureService: ImgCaptureService

    ) { }

    @ApiOperation({ summary: "add img capture" })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Get("")
    async getImageCapture(@Query('imagecaptureId') imagecaptureId?: string): Promise<ApiResponse> {
        if (!imagecaptureId) {
            throw new BadRequestException("unknow imagecaptureId")
        }
        try {
            const data = await this.imgCaptureService.getImageCaptureId(parseInt(imagecaptureId));
            return {
                message: "Success",
                statusCode: HttpStatus.CREATED,
                data: {
                    imgCapId: data.imgCapId,
                    cameraName: data.camera.cameraName,
                    imgFile: 'data:image/png;base64,' + data.imgFile,
                    timeStamp: (new Date(data.timeStamp)).toLocaleString().replace(',', ''),
                    cameraId: data.camera.cameraId
                }
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: "add img capture" })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Get("/nearest")
    async getImageCaptureAndSurroundingRows(
        @Session() session: SessionData,
        @Query('imagecaptureId') imagecaptureId?: string,
        @Query('cameraId') cameraId?: string): Promise<ApiResponse> {
        if (!imagecaptureId) {
            throw new BadRequestException("unknow imagecaptureId")
        }
        try {
            const data = await this.imgCaptureService.getImageSurroundingRows(parseInt(imagecaptureId), cameraId);
            for (const iterator of data.imageCapturesBefore) {
                try {
                    this.AppGateway.server.emit(session.user.dataUser.organizationId + '-admin-image-before', JSON.stringify({
                        imgCapId: iterator.imgCapId,
                        cameraName: iterator.camera.cameraName,
                        imgFile: 'data:image/png;base64,' + iterator.imgFile,
                        timeStamp: (new Date(iterator.timeStamp)).toLocaleString().replace(',', ''),
                        cameraId: iterator.camera.cameraId
                    }))
                } catch { }
            }
            this.AppGateway.server.emit(session.user.dataUser.organizationId + '-admin-image-before-closed')
            for (const iterator of data.imageCapturesAfter) {
                try {
                    this.AppGateway.server.emit(session.user.dataUser.organizationId + '-admin-image-after', JSON.stringify({
                        imgCapId: iterator.imgCapId,
                        cameraName: iterator.camera.cameraName,
                        imgFile: 'data:image/png;base64,' + iterator.imgFile,
                        timeStamp: (new Date(iterator.timeStamp)).toLocaleString().replace(',', ''),
                        cameraId: iterator.camera.cameraId
                    }))
                } catch { }
            }
            this.AppGateway.server.emit(session.user.dataUser.organizationId + '-admin-image-after-closed')
            return {
                message: "Success",
                statusCode: HttpStatus.CREATED,
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: "add img capture" })
    @Post("/create")
    async createImageCapture(@Body() requestImgCapture: ImageCaptureDTO): Promise<ApiResponse> {
        try {
            await this.imgCaptureService.createImageCapture(requestImgCapture);
            return {
                message: "Added Success",
                statusCode: HttpStatus.CREATED
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: "get img capture By camera" })
    @Get("/bycamera/:id")
    async getImageCaptureByIdCamera(@Param("id") cameraId: string): Promise<ApiResponse> {
        try {
            const imgCaps = this.imgCaptureService.getImageCaptureByIdCamera(cameraId);
            return {
                message: "Success",
                statusCode: HttpStatus.CREATED,
                data: imgCaps
            }
        } catch (error) {
            throw error
        }
    }


}
