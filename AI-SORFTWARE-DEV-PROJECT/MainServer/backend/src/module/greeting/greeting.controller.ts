import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Session, UseGuards } from '@nestjs/common';
import { GreetingService } from './greeting.service';
import { GreetingDTO } from './dto/greeting.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/guard/Roles.guard';
import { Role, Roles } from 'src/decorator/roles.decorator';
import { SessionData } from 'express-session';
import { AppGateway } from 'src/app.gateway';

@ApiTags('Greeting')
@UseGuards(RolesGuard)
@Controller('')
export class GreetingController {

    constructor(
        private AppGateway: AppGateway,
        private greetingService: GreetingService
    ) { }

    @ApiOperation({ summary: 'Get All Greeting', description: '' })
    @Roles([Role.CAMERA, Role.ADMIN, Role.SYSTEMADMIN])
    @Get("/:organizationId?")
    async getGreetingAll(
        @Session() session: SessionData,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string='50',
        @Query('filter') filter: string,
        @Param('organizationId') organizationId?: string,
        ): Promise<ApiResponse> {
        try {
            const currentUser = organizationId ? organizationId : session.user.dataUser.organizationId;
            return {
                message: "success",
                statusCode: HttpStatus.OK,
                data: await this.greetingService.getGreetingAll(parseInt(page),parseInt(pageSize),currentUser, filter),
                number:await this.greetingService.getGreetingNumber(currentUser, filter)
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Add Greeting', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Post("/create")
    async createGreeting(@Body() requestGreeting: GreetingDTO): Promise<ApiResponse> {
        try {
            const data = await this.greetingService.createGreeting(requestGreeting)
            this.AppGateway.server.emit(requestGreeting.organizationId + '-camera-greeting-listening', JSON.stringify({
                method: 'add',
                greetingId: data.greetingId,
                message: data.message,
                emotion:data.emotion,
                organization:{
                    organizationId:requestGreeting.organizationId
                }
            }))
            return {
                message: "add greeting success",
                statusCode: HttpStatus.CREATED,
                data: data.greetingId,
            }
        } catch (error) {
            throw error

        }
    }

    @ApiOperation({ summary: 'update  Greeting By Id', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Put("/update")
    async updateGreeting(@Session() session:SessionData,@Body() updateGreeting: GreetingDTO): Promise<ApiResponse> {
        try {
            const data = await this.greetingService.updateGreeting(updateGreeting);
            this.AppGateway.server.emit(session.user.dataUser.organizationId + '-camera-greeting-listening', JSON.stringify({
                method: 'update',
                greetingId: data.greetingId,
                message: data.message,
                emotion:data.emotion
            }))
            return {
                message: "update success",
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            throw error

        }
    }

    @ApiOperation({ summary: 'Delete Greeting', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Delete("/delete/:id")
    async deleteEmployeeById(@Session() session:SessionData,@Param('id') greetingId: string): Promise<ApiResponse> {
        try {
            const greeting = await this.greetingService.deleteGreetingById(parseInt(greetingId));
            this.AppGateway.server.emit(session.user.dataUser.organizationId + '-camera-greeting-listening', JSON.stringify({
                method: 'delete',
                greetingId: greeting.greetingId,
                emotion:greeting.emotion
            }))
            return {
                message: "delete success",
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            throw error
        }
    }

}
