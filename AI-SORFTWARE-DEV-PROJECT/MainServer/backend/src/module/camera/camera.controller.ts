import { SessionData } from 'express-session';
import { CameraService } from './camera.service';
import { RolesGuard } from 'src/guard/Roles.guard';
import { Role, Roles } from "src/decorator/roles.decorator";
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AdminUpdateCameraDto, CameraDto, systemAdminUpdateCameraDto } from './dto/camera.dto';
import { Controller, Session, UseGuards, Get, Body, HttpStatus, Post, Put, Delete, Param, Query } from '@nestjs/common';

@ApiTags('Camera')
@Controller('')
@UseGuards(RolesGuard)
export class CameraController {

    constructor(
        private cameraService: CameraService
    ) { }

    @ApiOperation({ summary: 'get All Camera', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @ApiParam({ name: 'organizationId', required: false, description: 'specific organization' })
    @Get(":organizationId?")
    async getAllCamera(
        @Session() session: SessionData,
        @Query("page") page: string = '1',
        @Query("pageSize") pageSize: string='50',
        @Param('organizationId') organizationId?: string,
        @Query("filter") filter?: string,
    ): Promise<ApiResponse> {
        try {
            const orgId: string | undefined = organizationId ? organizationId : session?.user?.dataUser?.organizationId
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: await this.cameraService.getAllCamera(parseInt(page),parseInt(pageSize),orgId,filter),
                number: await this.cameraService.getCameraNumber(orgId,filter)
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Create Camera', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Post("/create")
    async createCamera(@Body() requestCamera: CameraDto): Promise<ApiResponse> {
        try {
            await this.cameraService.createCamera(requestCamera);
            return {
                message: "create success",
                statusCode: HttpStatus.CREATED
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'System Admin Update Camera Infomation', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Put("/system-admin/update")
    async updateCamera(@Body() updateCamera: systemAdminUpdateCameraDto): Promise<ApiResponse> {
        try {
            await this.cameraService.updateCamera(updateCamera)
            return {
                message: "update success",
                statusCode: HttpStatus.OK
            }
        } catch (error) {
            throw error
        }

    }

    @ApiOperation({ summary: 'Admin Update Camera Infomation', description: '' })
    @Roles([Role.ADMIN])
    @Put("/admin/update")
    async adminUpdateCamera( @Body() updateCamera: AdminUpdateCameraDto): Promise<ApiResponse> {
        try {
            await this.cameraService.adminUpdateCamera(updateCamera)
            return {
                message: "update success",
                statusCode: HttpStatus.OK
            }
        } catch (error) {
            throw error
        }

    }

    @ApiOperation({ summary: 'Delete Camera', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Delete(":id")
    async deleteCamera(@Param('id') cameraId: string): Promise<ApiResponse> {

        try {
            await this.cameraService.deleteCamera(cameraId);
            return {
                message: "delete success",
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            throw error
        }
    }
}