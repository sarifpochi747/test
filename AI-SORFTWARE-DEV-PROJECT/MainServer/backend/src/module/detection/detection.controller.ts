import { Cache } from "cache-manager";
import { AppGateway } from 'src/app.gateway';
import { SessionData } from 'express-session';
import { RolesGuard } from 'src/guard/Roles.guard';
import { HttpService } from 'src/http/http.service';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { DetectionService } from './detection.service';
import { Detection } from 'src/entity/detection.entity';
import { Role, Roles } from 'src/decorator/roles.decorator';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CameraClientDto } from '../camera-client/dto/camera-client.dto';
import { CreateDetectionDto, DetectionReqDto } from './dto/detection.dto';
import { BadRequestException, Body, Controller, Get, HttpStatus, Inject, Param, Post, Query, Session, UseGuards } from '@nestjs/common';
import { EmbeddedService } from "../embedded/embedded.service";
@ApiTags('Detection')
@UseGuards(RolesGuard)
@Controller('')
export class DetectionController {

    constructor(
        private AppGateway: AppGateway,
        private httpService: HttpService,
        private detectionService: DetectionService,
        private embeddedService: EmbeddedService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,

    ) { }
    @ApiOperation({ summary: 'Get Transaction Graph', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Get("/get-organization-transaction")
    async getOrganizationTransaction(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<ApiResponse> {
        try {
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: await this.detectionService.getOrganizationTransaction(startDate, endDate)
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Get Transaction Graph', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @ApiParam({ name: 'organizationId', required: false, description: 'specific organization' })
    @Get("/get-transaction-graph/:organizationId?")
    async getTransactionGrapt(
        @Session() session: SessionData,
        @Param('organizationId') organizationId?: string,
        @Query('filter') filter?: 'day' | 'month' | 'year'
    ): Promise<ApiResponse> {

        const orgId: string | undefined = organizationId ? organizationId : session?.user?.dataUser?.organizationId
        try {
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: await this.detectionService.getTransactionGrapt(filter, orgId)
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Get Emotion Graph', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @ApiParam({ name: 'organizationId', required: false, description: 'specific organization' })
    @Get("/get-emotion-graph/:organizationId?")
    async getEmotionGraph(
        @Session() session: SessionData,
        @Param('organizationId') organizationId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<ApiResponse> {

        const orgId: string | undefined = organizationId ? organizationId : session?.user?.dataUser?.organizationId
        if (!orgId) throw new BadRequestException("Unknow organization id")

        try {
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: await this.detectionService.getEmotionGraph(startDate, endDate, orgId)
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Get Detection Specific Member', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @ApiParam({ name: 'Member id', required: false, description: 'specific Member' })
    @Get("/user-detection/:id")
    async getDetectionSpecificMember(
        @Session() session: SessionData,
        @Param('id') id: string,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '50',
    ): Promise<ApiResponse> {

        let detections: Detection[];
        const orgId: string | undefined = session?.user?.dataUser?.organizationId

        if (!orgId) throw new BadRequestException("Unknow organization id")

        try {
            detections = await this.detectionService.getDetectionSpecificMember(parseInt(page), parseInt(pageSize), orgId, id)
        } catch (error) {
            throw error
        }
        try {
            for (const data of detections) {
                try {
                    const cropImg = await this.detectionService.cropImg(data.imageCapture.imgFile, data.facePosition)
                    this.AppGateway.server.emit(orgId + '-admin-specific-user-detection', JSON.stringify({
                        trackingId: data.detectId,
                        image: cropImg,
                        camera: data.imageCapture?.camera.cameraName,
                        imagecaptureId: data.imageCapture?.imgCapId || null,
                        name: data.embedded?.employee.name || null,
                        gender: data.gender,
                        age: data.age,
                        emotion: data.emotion,
                        dateTime: (new Date(data.imageCapture.timeStamp)).toLocaleString().replace(',', '')
                    }))
                } catch { }
            }
            this.AppGateway.server.emit(orgId + '-admin-specific-user-detection-closed')
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: await this.detectionService.getDetectionSpecificMemberNumber(orgId, id)
            }
        } catch (error) {
            throw error
        }

    }

    @ApiOperation({ summary: 'Get All Detection', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @ApiParam({ name: 'organizationId', required: false, description: 'specific organization' })
    @Post("")
    async getAllDetection(
        @Session() session: SessionData,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '50',
        @Query('organizationId') organizationId?: string,
        @Query('imagecaptureId') imagecaptureId?: string,
        @Body() body?: DetectionReqDto,
    ): Promise<ApiResponse> {
        let detections: Detection[];
        const orgId: string | undefined = organizationId ? organizationId : session?.user?.dataUser?.organizationId

        if (!orgId) throw new BadRequestException("Unknow organization id")

        try {
            detections = await this.detectionService.getAllDetection(body, parseInt(page), parseInt(pageSize), imagecaptureId ? parseInt(imagecaptureId) : null, orgId)
        } catch (error) {
            throw error
        }
        try {
            for (const data of detections) {
                try {
                    const cropImg = await this.detectionService.cropImg(data.imageCapture.imgFile, data.facePosition)
                    this.AppGateway.server.emit(orgId + '-admin-detection', JSON.stringify({
                        trackingId: data.detectId,
                        image: cropImg,
                        camera: data.imageCapture?.camera.cameraName,
                        name: data.embedded?.employee.name || null,
                        mamberId: data.embedded?.employee.employeeId || null,
                        gender: data.gender,
                        age: data.age,
                        emotion: data.emotion,
                        dateTime: (new Date(data.imageCapture.timeStamp)).toLocaleString().replace(',', ''),
                        imagecaptureId: data.imageCapture?.imgCapId || null
                    }))
                    
                } catch { }
                
            }
            this.AppGateway.server.emit(orgId + '-admin-detection-closed')
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: await this.detectionService.getDectionNumber(body, orgId)
            }
        } catch (error) {
            throw error
        }
    }


    @ApiOperation({ summary: 'Get All Detection', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @ApiParam({ name: 'organizationId', required: false, description: 'specific organization' })
    @Post("/search-by-image")
    async getDetectionByImage(
        @Session() session: SessionData,
        @Query('organizationId') organizationId?: string,
        @Body() body?: DetectionReqDto,
    ): Promise<ApiResponse> {
        let detections: Detection[];
        const orgId: string | undefined = organizationId ? organizationId : session?.user?.dataUser?.organizationId

        if (!orgId) throw new BadRequestException("Unknow organization id")

        try {
            detections = await this.detectionService.getDetectionByImage(body, orgId)
        } catch (error) {
            throw error
        }
        try {
            const emb = await this.embeddedService.predictEmbedded(body.image)
            for (const data of detections) {
                try {
                    const res: boolean = await this.httpService.post('/verify-face', { coreface: emb, detectface: data.embedding })
                    if (res) {
                        const cropImg = await this.detectionService.cropImg(data.imageCapture.imgFile, data.facePosition)
                        this.AppGateway.server.emit(orgId + '-admin-detection', JSON.stringify({
                            trackingId: data.detectId,
                            image: cropImg,
                            camera: data.imageCapture?.camera.cameraName,
                            name: data.embedded?.employee.name || null,
                            mamberId: data.embedded?.employee.employeeId || null,
                            gender: data.gender,
                            age: data.age,
                            emotion: data.emotion,
                            dateTime: (new Date(data.imageCapture.timeStamp)).toLocaleString().replace(',', ''),
                            imagecaptureId: data.imageCapture?.imgCapId || null
                        }))
                    }
                } catch { }
            }
            this.AppGateway.server.emit(orgId + '-admin-detection-closed')
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: await this.detectionService.getDectionNumber(body, orgId)
            }
        } catch (error) {
            throw error
        }
    }


    @ApiOperation({ summary: 'add detection', description: '' })
    @Roles([Role.CAMERA, Role.SYSTEMADMIN])
    @Post("/create")
    async createDetection(@Body() requestDetection: CreateDetectionDto): Promise<ApiResponse> {
        try {
            const authCheck: CameraClientDto = await this.cacheManager.get(requestDetection.cameraId)
            try {
                this.detectionService.createDetection(requestDetection)
            } catch (error) {
                throw error
            }
            if (!authCheck || authCheck?.accessToken !== requestDetection.accessToken) {
                this.AppGateway.server.emit(requestDetection.accessToken + 'force-exit')
            }
            return {
                message: "Success",
                statusCode: HttpStatus.CREATED
            }
        } catch (error) {
            throw error
        }
    }



}
