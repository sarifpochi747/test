import { Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { FindManyOptions, Like, Repository, createQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from 'src/entity/employee.entity';
import { OrganizationService } from '../organization/organization.service';
import { RequestEmployee, checkImgRes, createEmployeeResponseDto } from './dto/employee.dto';
import { HttpService } from 'src/http/http.service';
import { Organization } from 'src/entity/organization.entity';
import { Status } from 'src/declarations/status';
import { UniqueData } from 'src/entity/unique-data.entity';
import { UniqueColumn } from 'src/entity/unique-column.entity';

@Injectable()
export class EmployeeService {


    constructor(
        @InjectRepository(Employee) private employeeRepository: Repository<Employee>,
        @InjectRepository(UniqueColumn) private uniqueColumnRepository: Repository<UniqueColumn>,
        @InjectRepository(UniqueData) private uniqueDataRepository: Repository<UniqueData>,
        private organizeService: OrganizationService,
        private httpService: HttpService,
    ) { }

    async getEmployeeNumber(organizationId: string,filter?:string): Promise<Number> {
        try {
            const organization = await this.organizeService.findById(organizationId)
            const filterOptions: FindManyOptions<Employee> = {
                where: { organization, status: Status.ACTIVE },
                order: { name: 'ASC' },
            };
            if (filter && filter !== '') {
                filterOptions.where = {
                    ...filterOptions.where,
                    name: Like(`%${filter}%`)
                };
            }
            return await this.employeeRepository.count(filterOptions);
        } catch (error) {
            throw new InternalServerErrorException(error.message || 'Internal Server Error');
        }
    }

    async getEmployeeAll(
        organizationId: string,
        filter?: string,
        page: number = 1,
        pageSize: number = 50): Promise<Employee[]> {
        try {
            const organization = await this.organizeService.findById(organizationId)
            const filterOptions: FindManyOptions<Employee> = {
                where: { organization, status: Status.ACTIVE },
                order: { name: 'ASC' },
                skip: (page - 1) * pageSize,
                take: pageSize
            };
            if (filter && filter !== '') {
                filterOptions.where = {
                    ...filterOptions.where,
                    name: Like(`%${filter}%`)
                };
            }
            return await this.employeeRepository.find(filterOptions);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getSpecificEmployee(employeeId: string): Promise<Employee> {
        try {
            const employee = await this.employeeRepository.findOneBy({ employeeId: employeeId, status: Status.ACTIVE })
            employee.uniqueData = await this.findUniqueDataByEmp(employee)
            return employee
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async createEmployee(requestEmp: RequestEmployee, organizationId: string): Promise<createEmployeeResponseDto> {
        let organization: Organization;
        const UniqueColumnErr = []
        try {
            organization = await this.organizeService.findById(organizationId);
        } catch {
            throw new InternalServerErrorException()
        }

        if (!organization)  throw new UnauthorizedException()

        try {
            const employee = this.employeeRepository.create({
                name: requestEmp.name,
                address: requestEmp.address,
                gender: requestEmp.gender,
                phone: requestEmp.phone,
                birthday: requestEmp.birthday,
                profileImage: requestEmp.profileImage,
                organization: organization
            })

            const employeeId = await this.employeeRepository.save(employee);

            if (requestEmp.uniqueData) {
                for (const data of requestEmp.uniqueData) {
                    let uniqueColumn: UniqueColumn;

                    try {
                        uniqueColumn = await this.findUniqueColumnById(data.uniqColId);
                        const uniqueColumnCreated = this.uniqueDataRepository.create({
                            uniqColData: data.uniqColData,
                            uniqueColumn: uniqueColumn,
                            employee: employeeId,
                        })
                        await this.uniqueDataRepository.save(uniqueColumnCreated);
                    } catch {
                        UniqueColumnErr.push("มีข้อผิดพลาดเกิดขึ้นกับคอลัมน์ " + uniqueColumn.uniqColName)
                    }
                }
            }

            if (!employeeId) throw new InternalServerErrorException()

            return { employeeId: employeeId.employeeId, uniqueColumnErr: UniqueColumnErr }
        } catch {
            throw new InternalServerErrorException()
        }
    }

    async updateEmployee(employeeId: string, updateEmployee: RequestEmployee): Promise<void> {
        try {
            const employee = await this.findById(employeeId);

            if (!employee)  throw new BadRequestException()

            employee.name = updateEmployee.name;
            employee.phone = updateEmployee.phone;
            employee.address = updateEmployee.address;
            employee.gender = updateEmployee.gender;
            employee.birthday = new Date(updateEmployee.birthday);
            employee.profileImage = updateEmployee.profileImage;
            await this.employeeRepository.save(employee)

            for (const data of updateEmployee.uniqueData) {
                try {
                    const uniqColData = await this.findUniqueDataById(data.uniqueDataId);
                    uniqColData.uniqColData = data.uniqColData
                    await this.uniqueDataRepository.save(uniqColData);
                } catch(e) {
                    throw new InternalServerErrorException(e)
                }
            }
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }


    async deleteEmployeeById(employeeId: string): Promise<void> {
        try {
            const employee = await this.findById(employeeId);
            if (!employee)  throw new BadRequestException('employee is not available');
            employee.status = Status.DISABLE
            await this.employeeRepository.save(employee)
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async findById(employeeId: string): Promise<Employee | undefined> {
        try {
            return await this.employeeRepository.findOneBy({ employeeId: employeeId })
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async findUniqueColumnById(id: string): Promise<UniqueColumn | undefined> {
        const uniqueColumn = await this.uniqueColumnRepository.findOneBy({ uniqColId: id });
        return uniqueColumn;
    }

    async findUniqueDataById(id: string): Promise<UniqueData | undefined> {
        const uniqueData = await this.uniqueDataRepository.findOneBy({ uniqDataId: id });
        return uniqueData;
    }

    async findUniqueDataByEmp(empId: Employee): Promise<UniqueData[] | undefined> {
        try {
            return this.uniqueDataRepository
                .createQueryBuilder('UniqueData')
                .innerJoinAndSelect('UniqueData.uniqueColumn', 'uniqueColumn')
                .where({ employee: empId })
                .getMany();
        } catch (error) {
            console.error('Error while finding unique data:', error);
            return undefined;
        }
    }

    async checkImg(img: string): Promise<checkImgRes> {
        try {
            return this.httpService.post('/verify-img', {
                imgB64: img
            })
        } catch (e) {
            throw new InternalServerErrorException(e)
        }

    }


    async findByOrganizationId(organizationId: string): Promise<Employee[] | undefined> {
        const organization = await this.organizeService.findById(organizationId);
        return await this.employeeRepository.findBy({ organization: organization })
    }
}
