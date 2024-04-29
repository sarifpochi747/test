import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, InternalServerErrorException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { EmbeddedService } from './embedded.service';
import { RolesGuard } from 'src/guard/Roles.guard';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EmbeddedRequestDTO } from './dto/embedded.dto';
import { Role, Roles } from 'src/decorator/roles.decorator';

@ApiTags('Embedded')
@UseGuards(RolesGuard)
@Controller('')
export class EmbeddedController {

    constructor(
        private embeddedService: EmbeddedService
    ) { }

    @ApiOperation({ summary: 'Get Employee Embedded ', description: '' })
    @Get("/specific/:id")
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    async getEmployeeEmbeddedById(@Param("id") employeeId: string): Promise<ApiResponse> {
        try {
            const embedded = await this.embeddedService.getEmbeddedById(employeeId)
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: embedded
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Get Embedded ', description: '' })
    @ApiQuery({ name: 'organizationId', required: true, description: 'specific organization' })
    @Roles([Role.CAMERA, Role.SYSTEMADMIN])
    @Get("")
    async getEmployeeEmbeddedAll(@Query('organizationId') organizationId?: string,): Promise<ApiResponse> {
        try {
            const embeddeds = await this.embeddedService.getEmbedded(organizationId)
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: embeddeds
            }
        } catch (error) {
    throw error
        }
    }

    @ApiOperation({ summary: 'add Embedded', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Post("/create")
    async addEmbedded(@Body() embedded: EmbeddedRequestDTO): Promise<ApiResponse> {

        try {
            await this.embeddedService.addEmdedded(embedded);
            return {
                message: "Added Success",
                statusCode: HttpStatus.CREATED
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Delete Embedded By Id', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Delete(":id")
    async deleteEmployeeById(@Param('id') embeddedId: number): Promise<ApiResponse> {

        try {
            await this.embeddedService.deleteEmbeddedById(embeddedId);
            return {
                message: "delete success",
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            throw error
        }
    }

}
