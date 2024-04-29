import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Embedded } from 'src/entity/embedded.entity';
import { Repository } from 'typeorm';
import { EmployeeService } from '../employee/employee.service';
import { EmbeddedRequestDTO } from './dto/embedded.dto';
import { HttpService } from 'src/http/http.service';
import { Employee } from 'src/entity/employee.entity';

@Injectable()
export class EmbeddedService {

    constructor(@InjectRepository(Embedded)
    private embeddedRepository: Repository<Embedded>,
        private employeeService: EmployeeService,
        private httpService: HttpService,
    ) { }

    async predictEmbedded(predictEmbedded: string): Promise<string> {
        try {
            return await this.httpService.post('/predict-embedding', { imgB64: predictEmbedded })
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async addEmdedded(embeddedRequest: EmbeddedRequestDTO): Promise<void> {
        let employee: Employee;
        try {
            employee = await this.employeeService.findById(embeddedRequest.employeeId);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }

        if (!employee) throw new NotFoundException("employee was not found");

        try {
            const embedding = await this.predictEmbedded(embeddedRequest.imgB64);
            const embedded = this.embeddedRepository.create({
                embedding: embedding,
                employee: employee
            });

            await this.embeddedRepository.save(embedded);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getEmbeddedById(employeeId: string): Promise<Embedded[]> {
        try {
            const employee = await this.employeeService.findById(employeeId);
            return await this.embeddedRepository.findBy({ employee: employee });
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getEmbedded(organizationId: string): Promise<Embedded[]> {
        try {
            let embedded = await this.embeddedRepository.createQueryBuilder('embedded')
                .leftJoinAndSelect('embedded.employee', 'employee')
                .leftJoinAndSelect('employee.organization', 'organization')
                .select(['embedded.embeddedId', 'embedded.embedding', 'employee.employeeId', 'employee.name'])
                .where(`organization."organizationId" = '${organizationId}'`)
                .getMany()
            return embedded;
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async deleteEmbeddedById(embeddedId: number): Promise<void> {

        const employee = await this.findById(embeddedId);
        if (!employee) throw new BadRequestException('embedded is not available');
        try {
            await this.embeddedRepository.delete(embeddedId);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async findById(embeddedId: number): Promise<Embedded | undefined> {
        try {
            return await this.embeddedRepository.findOneBy({ embeddedId: embeddedId })
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}
