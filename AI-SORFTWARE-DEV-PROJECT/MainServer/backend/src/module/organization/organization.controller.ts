import { Body, Controller, Get, Param, Post, HttpStatus, UseGuards, Delete, Put, UseInterceptors, ClassSerializerInterceptor, Session, BadRequestException, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { RolesGuard } from 'src/guard/Roles.guard';
import { RequestOrganizationDTO, RequestOrganizationUpadateDTO, changPasswordOrganizationDTO, createUniqColumnDto, updateUniqColumnDto } from './dto/organization.dto';
import { Role, Roles } from 'src/decorator/roles.decorator';
import { SessionData } from 'express-session';


@ApiTags('Organization')
@UseGuards(RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('')
export class OrganizationController {

    constructor(private organizationService: OrganizationService) { }

    @ApiOperation({ summary: 'Get All Organization', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Get('/all')
    async getAllOrganization(
        @Query('page') page:string = '1',
        @Query('pageSize') pageSize:string = '50',
        @Query('filter') filter:string
        ): Promise<ApiResponse> {

        try {
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: await this.organizationService.getAllOrganization(parseInt(page),parseInt(pageSize),filter),
                number:await this.organizationService.getAllOrganizationNumber(filter)
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Get Specific Organization', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Get('specific/:id')
    async getOrganizationById(@Param('id') id: string): Promise<ApiResponse> {
        try {
            const organization = await this.organizationService.findById(id);
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: organization
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Get Organization Unique Column', description: '' })
    @ApiParam({ name: 'id', required: false, description: 'organization id' })
    @Roles([Role.ADMIN,Role.SYSTEMADMIN])
    @Get('/unique-column/:id?')
    async getOrganizationUniqueColumn(@Session() session:SessionData,@Param('id') id?: string): Promise<ApiResponse> {
        try {
            const ordId = id ? id : session.user.dataUser.organizationId
            const uniqueConlumn = await this.organizationService.getUniqueConlumn(ordId);
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: uniqueConlumn
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Update Organization Infomation', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Post("/create/uniq-column")
    async createUniqColumn(@Body() createUniqColumn: createUniqColumnDto): Promise<ApiResponse> {
        try {
            const uniqColId = await this.organizationService.createUniqColumn(createUniqColumn);
            return {
                message: "create success",
                statusCode: HttpStatus.CREATED,
                data:uniqColId
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Create Organization', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Post("/create")
    async createOrganization(@Body() reqOrg: RequestOrganizationDTO): Promise<ApiResponse> {
        try {
            await this.organizationService.createOrganization(reqOrg);
            return {
                message: "successfully created organization",
                statusCode: HttpStatus.CREATED
            };

        } catch (error) {
            throw error
        }
    }



    @ApiOperation({ summary: 'Update Organization Infomation', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Put("/update/:id")
    async updateOrganization(@Param("id") id: string, @Body() updateOrg: RequestOrganizationUpadateDTO): Promise<ApiResponse> {
        try {
            await this.organizationService.updateOrganization(id, updateOrg);
            return {
                message: "update success",
                statusCode: HttpStatus.OK
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Update Unique Column', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Put("/update-unique-column")
    async updateUniqueColumn(@Body() updateUniqColumn: updateUniqColumnDto): Promise<ApiResponse> {
        try {
            if (!updateUniqColumn.uniqueColumnName || updateUniqColumn.uniqueColumnName.trim() === '') {
                throw new BadRequestException("ชื่อคอลัมน์ต้องไม่เป็นช่องว่าง")
            }

            await this.organizationService.updateUniqueColumn(updateUniqColumn);
            return {
                message: "update success",
                statusCode: HttpStatus.OK
            }

        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Update Organization Password', description: '' })
    @Roles([Role.ADMIN])
    @Put("/update-password")
    async updateOrganizationPassword(@Session() session: SessionData, @Body() updatePassOrg: changPasswordOrganizationDTO): Promise<ApiResponse> {
        try {
            if (!updatePassOrg.newPassword || updatePassOrg.newPassword.trim() === '') {
                throw new BadRequestException("รหัสผ่านใหม่ไม่ถูกต้อง")
            }
            if (updatePassOrg.newPassword.length < 8) {
                throw new BadRequestException("รหัสผ่านใหม่สั้นเกินไป")
            }
            if (updatePassOrg.newPassword !== updatePassOrg.confirmPassword) {
                throw new BadRequestException("รหัสผ่านไม่ตรงกัน")
            }

            await this.organizationService.updateOrganizationPassword(session.user.dataUser, updatePassOrg);
            return {
                message: "update success",
                statusCode: HttpStatus.OK
            }

        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Delete Organization', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Delete('/delete/:id')
    async deleteOrganizationById(@Param('id') id: string): Promise<ApiResponse> {

        try {
            await this.organizationService.deleteById(id);
            return {
                message: "delete success",
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Delete Unique Column', description: '' })
    @Roles([Role.SYSTEMADMIN])
    @Delete('/delete-unique-column/:id')
    async deletUniqueColumnById(@Param('id') id: string): Promise<ApiResponse> {

        try {
            await this.organizationService.deletUniqueColumn(id);
            return {
                message: "delete success",
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            throw error
        }
    }



}


