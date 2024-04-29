import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Greeting } from 'src/entity/greeting.entity';
import { Repository } from 'typeorm';
import { OrganizationService } from '../organization/organization.service';
import { GreetingDTO } from './dto/greeting.dto';
import { Organization } from 'src/entity/organization.entity';

@Injectable()
export class GreetingService {


    constructor(
        @InjectRepository(Greeting)
        private greetingRepository: Repository<Greeting>,
        private organizationService: OrganizationService
    ) { }

    async getGreetingNumber(organizationId: string, filter: string): Promise<number> {
        if (organizationId) {
            let organization: Organization
            try {
                organization = await this.organizationService.findById(organizationId);
            } catch (e) {
                throw new InternalServerErrorException(e)
            }
            if (!organization) throw new BadRequestException("organizationId not found")

            try {
                let greetings = this.greetingRepository
                    .createQueryBuilder('greeting')
                    .leftJoinAndSelect('greeting.organization', 'organization')
                    .where(`greeting."organizationId" = '${organizationId}'`)
                    .orWhere(`greeting."organizationId" IS NULL`)
                if (filter) {
                    greetings = greetings.andWhere(`greeting."message" LIKE '%${filter}%'`)
                }
                return await greetings.getCount();
            } catch (e) {
                throw new InternalServerErrorException(e)
            }
        }

        try {
            let greetings = this.greetingRepository
                .createQueryBuilder('greeting')
                .leftJoinAndSelect('greeting.organization', 'organization')
            if (filter) {
                greetings = greetings.where(`greeting."message" LIKE '%${filter}%'`)
                greetings = greetings.orWhere(`organization."organizationName" LIKE '%${filter}%'`)
            }

            return await greetings.getCount();
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getGreetingAll(page: number, pageSize: number, organizationId: string, filter: string): Promise<Greeting[]> {
        if (organizationId) {
            let organization: Organization
            try {
                organization = await this.organizationService.findById(organizationId);
            } catch (e) {
                throw new InternalServerErrorException(e)
            }
            if (!organization) throw new BadRequestException("organizationId not found")

            try {
                let greetings = this.greetingRepository
                    .createQueryBuilder('greeting')
                    .leftJoinAndSelect('greeting.organization', 'organization')
                    .select([
                        'greeting.message',
                        'greeting.greetingId',
                        'greeting.emotion',
                        'organization.organizationId'
                    ])
                    .where(`greeting."organizationId" = '${organizationId}'`)
                    .orWhere(`greeting."organizationId" IS NULL`)
                if (filter) {
                    greetings = greetings.andWhere(`greeting."message" LIKE '%${filter}%'`)
                }
                if (filter) {
                    greetings = greetings.andWhere(`greeting."message" LIKE '%${filter}%'`)
                }
                return await greetings.orderBy('greeting.message', 'ASC').skip((page - 1) * pageSize).take(pageSize).getMany();
            } catch (e) {
                throw new InternalServerErrorException(e)
            }
        }
        try {
            let greetings = this.greetingRepository
                .createQueryBuilder('greeting')
                .leftJoinAndSelect('greeting.organization', 'organization')
                .select(['greeting', 'organization.organizationId']);
            if (filter) {
                greetings = greetings.where(`greeting.message LIKE '%${filter}%'`)
                                    .orWhere(`organization.organizationName LIKE '%${filter}%'`);
            }
            return  await greetings.orderBy('greeting.message', 'ASC')
                                      .skip((page - 1) * pageSize)
                                      .take(pageSize)
                                      .getMany();
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }


    async createGreeting(requestGreeting: GreetingDTO): Promise<Greeting> {
        try {
            const organization = await this.organizationService.findById(requestGreeting.organizationId);
            const greeting = this.greetingRepository.create({
                message: requestGreeting.message,
                emotion: requestGreeting.emotion,
                organization: requestGreeting.organizationId ? organization : null
            })
            return await this.greetingRepository.save(greeting);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async updateGreeting(updateGreeting: GreetingDTO): Promise<Greeting> {
        try {
            const greeting = await this.findById(updateGreeting.greetingId);
            greeting.message = updateGreeting.message;
            greeting.emotion = updateGreeting.emotion;
            return await this.greetingRepository.save(greeting);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async deleteGreetingById(greetingId: number): Promise<Greeting> {
        try {
            const greeting = await this.findById(greetingId);
            if (!greeting) throw new BadRequestException('greeting is not available');
            await this.greetingRepository.delete(greetingId);
            return greeting
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async findById(greetingId: number): Promise<Greeting | undefined> {
        try {
            return await this.greetingRepository.findOneBy({ greetingId: greetingId });
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

}
