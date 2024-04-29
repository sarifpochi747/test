import { Body, Controller, Get, HttpCode, Param, Post, UseGuards, Req, Res, HttpStatus, Session, Delete, Put, BadRequestException, UnauthorizedException, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { RolesGuard } from 'src/guard/Roles.guard';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { RequestEmployee, imgB64Req, checkImgRes, createEmployeeResponseDto } from './dto/employee.dto';
import { Role, Roles } from 'src/decorator/roles.decorator';
import { SessionData } from 'express-session';


@ApiTags('Employee')
@UseGuards(RolesGuard)
@Controller('')
export class EmployeeController {

    constructor(private empService: EmployeeService) { }

    @ApiOperation({ summary: 'Get Employee Number', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Get('/number')
    async getEmployeeNumber(@Session() session: SessionData,@Query() filter:string): Promise<ApiResponse> {
        try {
            const currentUserId = session.user.dataUser.organizationId;
            const employeesNumber = await this.empService.getEmployeeNumber(currentUserId,filter)
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: employeesNumber
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Get All Employee', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @ApiParam({ name: 'filter', required: false, description: 'filter' })
    @Get('')
    async getEmployeeAll(
        @Session() session: SessionData,
        @Query("filter") filter?: string,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '50',
    ): Promise<ApiResponse> {
        try {
            const currentUserId = session.user.dataUser.organizationId;
            const employees = await this.empService.getEmployeeAll(currentUserId, filter, parseInt(page), parseInt(pageSize))
            return {
                message: "Success",
                statusCode: HttpStatus.OK,
                data: employees
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Get Specific Employee', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Get('/profile/:memberId')
    async getSpecificEmployee(@Session() session: SessionData, @Param("memberId") EmployeeId: string): Promise<ApiResponse> {
        try {
            if (session.user) {
                const employees = await this.empService.getSpecificEmployee(EmployeeId)
                return {
                    message: "Success",
                    statusCode: HttpStatus.OK,
                    data: employees
                }
            } else {
                throw new UnauthorizedException()
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Create Employee', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Post("/create")
    async createEmployee(@Body() requestEmp: RequestEmployee, @Session() session: SessionData): Promise<ApiResponse> {
        if (!requestEmp.name || requestEmp.name.trim() === '') {
            throw new BadRequestException("ชื่อไม่ถูกต้อง")
        }

        if (!requestEmp.address || requestEmp.address.trim() === '') {
            throw new BadRequestException("ที่อยู่ไม่ถูกต้อง")
        }

        if (!requestEmp.birthday || String(requestEmp.birthday).trim() === '') {
            throw new BadRequestException("วันเกิดไม่ถูกต้อง")
        }

        if (!requestEmp.gender || !["Man", "Woman"].includes(requestEmp.gender)) {
            throw new BadRequestException("เพศไม่ถูกต้อง")
        }

        if (!requestEmp.phone || requestEmp.phone.trim() === '' || requestEmp.phone.length !== 10 || requestEmp.phone[0] !== '0') {
            throw new BadRequestException("เบอร์มือถือไม่ถูกต้อง")
        }

        if (!requestEmp.profileImage || requestEmp.profileImage.trim() === '') {
            throw new BadRequestException("ภาพโปรไฟล์ไม่ถูกต้อง")
        }

        try {
            const currentUserId: string = session.user.dataUser.organizationId;
            const data: createEmployeeResponseDto = await this.empService.createEmployee(requestEmp, currentUserId);
            return {
                message: "create employee success",
                statusCode: HttpStatus.CREATED,
                data: data
            }
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Create Employee', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Post("/verify-img")
    async verifyEmployeeImg(@Body() request: imgB64Req, @Session() session: SessionData): Promise<checkImgRes> {
        try {
            return await this.empService.checkImg(request.imgB64);
        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Update Employee Infomation', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Put("/update")
    async updateEmployee(@Body() updateEmp: RequestEmployee): Promise<ApiResponse> {
        if (!updateEmp.name || updateEmp.name.trim() === '') {
            throw new BadRequestException("ชื่อไม่ถูกต้อง")
        }

        if (!updateEmp.address || updateEmp.address.trim() === '') {
            throw new BadRequestException("ที่อยู่ไม่ถูกต้อง")
        }

        if (!updateEmp.birthday || String(updateEmp.birthday).trim() === '') {
            throw new BadRequestException("วันเกิดไม่ถูกต้อง")
        }

        if (!updateEmp.gender || !["Man", "Woman"].includes(updateEmp.gender)) {
            throw new BadRequestException("เพศไม่ถูกต้อง")
        }

        if (!updateEmp.phone || updateEmp.phone.trim() === '' || updateEmp.phone.length !== 10 || updateEmp.phone[0] !== '0') {
            throw new BadRequestException("เบอร์มือถือไม่ถูกต้อง")
        }

        if (!updateEmp.profileImage || updateEmp.profileImage.trim() === '') {
            throw new BadRequestException("ภาพโปรไฟล์ไม่ถูกต้อง")
        }
        try {

            await this.empService.updateEmployee(updateEmp.employeeId, updateEmp);
            return {
                message: "update success",
                statusCode: HttpStatus.OK
            }

        } catch (error) {
            throw error
        }
    }

    @ApiOperation({ summary: 'Delete Employee', description: '' })
    @Roles([Role.ADMIN, Role.SYSTEMADMIN])
    @Delete("/delete/:id")
    async deleteEmployeeById(@Param('id') employeeId: string): Promise<ApiResponse> {

        try {
            await this.empService.deleteEmployeeById(employeeId);
            return {
                message: "delete success",
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            throw error
        }
    }

}
