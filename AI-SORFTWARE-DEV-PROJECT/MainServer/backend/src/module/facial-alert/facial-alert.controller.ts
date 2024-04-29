import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Inject, InternalServerErrorException, Param, Post, Put, Query, Session, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role, Roles } from 'src/decorator/roles.decorator';
import { SessionData } from 'express-session';
import { AppGateway } from 'src/app.gateway';
import { FacialAlertService } from './facial-alert.service';
import { Alert } from 'src/entity/alert.entity';
import { CreateAlertDetectionDto, CreateAlertDto } from './dto/facial-alert.dto';
import { RolesGuard } from 'src/guard/Roles.guard';
import { AlertDetection } from 'src/entity/alert-detection.entity';

@ApiTags('Facial Alert')
@UseGuards(RolesGuard)
@Controller()
export class FacialAlertController {

    constructor(
        private AppGateway: AppGateway,
        private facialAlertService: FacialAlertService,
    ) { }

    @ApiOperation({ summary: 'Camera Get Alert', description: '' })
    @Roles([Role.CAMERA])
    @ApiParam({ name: 'organizationId', required: false, description: 'specific organization' })
    @Get("/camera-get-alert")
    async camGetAlert(
        @Query('organizationId') organizationId?: string,
    ): Promise<ApiResponse> {
        if (!organizationId) throw new BadRequestException("Unknow organization id")
        try {
            const alert = await this.facialAlertService.camGetAlert(organizationId)
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: alert
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Get All Alert', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @ApiParam({ name: 'organizationId', required: false, description: 'specific organization' })
    @Get("")
    async getAllAlert(
        @Session() session: SessionData,
        @Query('organizationId') organizationId?: string,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '50',
    ): Promise<ApiResponse> {
        let alert: Alert[];
        const orgId: string | undefined = organizationId ? organizationId : session?.user?.dataUser?.organizationId

        if (!orgId) throw new BadRequestException("Unknow organization id")

        try {
            alert = await this.facialAlertService.getAllAlert(parseInt(page), parseInt(pageSize), orgId)
        } catch (error) {
            throw error
        }
        try {
            for (const data of alert) {
                try {
                    this.AppGateway.server.emit(orgId + '-admin-facial', JSON.stringify({
                        id: data.alertId,
                        image: data.imgFile,
                        name: data.alertName,
                        dateCreate: (new Date(data.timeStamp)).toLocaleString().replace(',', '')
                    }))
                } catch { }
            }
            this.AppGateway.server.emit(orgId + '-admin-facial-closed')
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: await this.facialAlertService.getAlertNumber(orgId)
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Get All Alert', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @ApiParam({ name: 'organizationId', required: false, description: 'specific organization' })
    @Get("/specific/:id")
    async getSpecificAlert(@Param('id') id: string,): Promise<ApiResponse> {
        try {
            const alert = await this.facialAlertService.getSpecificAlert(parseInt(id))
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: {
                    id: alert.alertId,
                    image: alert.imgFile,
                    name: alert.alertName,
                    dateCreate: (new Date(alert.timeStamp)).toLocaleString().replace(',', '')
                }
            }
        } catch (e) {
            throw e
        }
    }

    @ApiOperation({ summary: 'Get All Alert', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @ApiParam({ name: 'organizationId', required: false, description: 'specific organization' })
    @Get("/alert-detection/:id")
    async getAlertDetection(
        @Session() session: SessionData,
        @Param('id') id: string,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '50',
    ): Promise<ApiResponse> {
        let alertDetection: AlertDetection[];
        const orgId: string | undefined = session?.user?.dataUser?.organizationId

        if (!orgId) throw new UnauthorizedException("Invalid session")

        try {
            alertDetection = await this.facialAlertService.getAlertDetection(parseInt(page), parseInt(pageSize), id)
        } catch (error) {
            throw error
        }
        try {
            for (const data of alertDetection) {
                try {
                    this.AppGateway.server.emit(orgId + '-admin-alert-detection', JSON.stringify({
                        id: data.alertDetectionId,
                        image: 'data:image/png;base64,' + data.imageCapture.imgFile,
                        imageId: data.imageCapture.imgCapId,
                        camera: data.imageCapture.camera.cameraName,
                        dateDetected: (new Date(data.imageCapture.timeStamp)).toLocaleString().replace(',', '')
                    }))
                } catch { }
            }
            this.AppGateway.server.emit(orgId + '-admin-alert-detection-closed')
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: await this.facialAlertService.getAlertDetectionNumber(id)
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Create Alert', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Post("/create")
    async createAlert(@Body() requestAlert: CreateAlertDto, @Session() session: SessionData): Promise<ApiResponse> {
        const orgId: string | undefined = session?.user?.dataUser?.organizationId
        try {
            const data = await this.facialAlertService.createAlert(requestAlert, session.user.dataUser.organizationId);
            this.AppGateway.server.emit(orgId + '-camera-alert-listening', JSON.stringify({
                method: 'add',
                alertId: data.alertId,
                embedding: data.embedding,
            }))
            return {
                message: "create alert success",
                statusCode: HttpStatus.CREATED,
                data: {
                    id: data.alertId,
                    image: data.imgFile,
                    name: data.alertName,
                    dateCreate: (new Date(data.timeStamp)).toLocaleString().replace(',', '')
                }
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'add Alert Detection', description: '' })
    @Roles([Role.CAMERA, Role.SYSTEMADMIN])
    @Post("/create-alert-detection")
    async createAlertDetection(@Body() requestDetection: CreateAlertDetectionDto): Promise<ApiResponse> {
        try {
            this.facialAlertService.createAlertDetection(requestDetection)
            return {
                message: "Success",
                statusCode: HttpStatus.CREATED
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Delete Alert', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Delete("/delete/:id")
    async deleteAlertStatus(@Session() session: SessionData, @Param('id') id: string): Promise<ApiResponse> {
        try {
            const data = await this.facialAlertService.deleteAlertById(parseInt(id));
            this.AppGateway.server.emit(session.user.dataUser.organizationId + '-camera-alert-listening', JSON.stringify({
                method: 'delete',
                alertId: data.alertId,
            }))
            return {
                message: "delete alert success",
                statusCode: HttpStatus.OK
            }
        } catch (error) {
            throw error
        }
    }

}
