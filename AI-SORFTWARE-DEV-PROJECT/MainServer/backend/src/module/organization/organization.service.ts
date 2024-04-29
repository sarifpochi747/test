import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from 'src/entity/organization.entity';
import { UniqueColumn } from 'src/entity/unique-column.entity';
import * as bcrypt from 'bcryptjs';
import { RequestOrganizationDTO, RequestOrganizationUpadateDTO, changPasswordOrganizationDTO, createUniqColumnDto, updateUniqColumnDto } from './dto/organization.dto';
import { DataUser } from 'src/auth/session';
import { UniqueData } from 'src/entity/unique-data.entity';

@Injectable()
export class OrganizationService {

    private saltOrRounds = 10;

    constructor(
        @InjectRepository(Organization) private orgRepository: Repository<Organization | undefined>,
        @InjectRepository(UniqueColumn) private uniqueColumnRepository: Repository<UniqueColumn | undefined>,
        @InjectRepository(UniqueData) private uniqueDataRepository: Repository<UniqueData | undefined>,
    ) { }
    async getAllOrganizationNumber(
        filter?: string,
    ): Promise<number> {
        try {
            let query = this.orgRepository.createQueryBuilder('organization')
            if (filter) {
                query.where(`(
                    organization."organizationName" LIKE '%${filter}%'
                    )`)
            }
            return await query.getCount()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getAllOrganization(
        page: number,
        pageSize: number,
        filter?: string,
    ): Promise<Organization[]> {
        try {
            let query = this.orgRepository.createQueryBuilder('organization')
            if (filter) {
                query.where(`(
                    organization."organizationName" LIKE '%${filter}%'
                    )`)
            }
            query.skip((page - 1) * pageSize).take(pageSize)
            return await query.getMany()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getUniqueConlumn(id: string): Promise<UniqueColumn[]> {
        const organization = await this.findById(id)
        return await this.uniqueColumnRepository.findBy({ organization: organization });
    }

    async createOrganization(requestOrganization: RequestOrganizationDTO): Promise<void> {
        try {

            if (await this.orgRepository.existsBy({ email: requestOrganization.email })) {
                throw new BadRequestException("Email already exists");
            }
            const hashPassword = await bcrypt.hash(requestOrganization.password, this.saltOrRounds);

            const organize = this.orgRepository.create({
                organizationName: requestOrganization.name,
                address: requestOrganization.address,
                phone: requestOrganization.phone,
                email: requestOrganization.email,
                password: hashPassword
            });
            const organization = await this.orgRepository.save(organize)

            for (const col of requestOrganization.uniqueColumn) {
                this.createUniqColumn({
                    uniqueColumnName: col.uniqueColumnName,
                    organizationId: organization.organizationId
                })
            }
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async createUniqColumn(createUniqColumnData: createUniqColumnDto): Promise<string> {
        try {
            const organization = await this.findById(createUniqColumnData.organizationId);

            if (!organization) {
                throw new NotFoundException('Organization was not found');
            }

            const uniqColumn = this.uniqueColumnRepository.create({
                organization: organization,
                uniqColName: createUniqColumnData.uniqueColumnName
            });

            return (await this.uniqueColumnRepository.save(uniqColumn)).uniqColId
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async updateOrganization(id: string, organizationUpdate: RequestOrganizationUpadateDTO): Promise<void> {
        try {
            const organization = await this.findById(id);
            const existEmail = await this.findByEmail(organizationUpdate.email)

            if (existEmail && existEmail.organizationId !== id) {
                throw new BadRequestException('Email already exists for another organization.');
            }
            if (organizationUpdate.organizationName) {
                organization.organizationName = organizationUpdate.organizationName;
            }
            if (organizationUpdate.address) {
                organization.address = organizationUpdate.address;
            }
            if (organizationUpdate.email) {
                organization.email = organizationUpdate.email;
            }
            if (organizationUpdate.phone) {
                organization.phone = organizationUpdate.phone;
            }
            if (organizationUpdate.status) {
                organization.organizeStatus = organizationUpdate.status;
            }
            if (organizationUpdate.newPassword &&
                organizationUpdate.confirmPassword &&
                organizationUpdate.newPassword.trim() !== '' &&
                organizationUpdate.newPassword === organizationUpdate.confirmPassword
            ) {
                const hashPassword = await bcrypt.hash(organizationUpdate.newPassword, this.saltOrRounds);
                organization.password = hashPassword;
            }


            await this.orgRepository.save(organization);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async updateOrganizationPassword(orgData: DataUser, organizationUpdate: changPasswordOrganizationDTO): Promise<void> {
        try {
            const organization: Organization = await this.findByEmail(orgData.email);

            if (!organization) throw new UnauthorizedException('invalid session');

            const hash: string = organization.password;
            const isMatch: boolean = await bcrypt.compare(organizationUpdate.currentPassword, hash);

            if (!isMatch) throw new NotFoundException("password is incorrect");

            const hashPassword = await bcrypt.hash(organizationUpdate.newPassword, this.saltOrRounds);
            organization.password = hashPassword
            await this.orgRepository.save(organization);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async updateUniqueColumn(updateUniqColumn: updateUniqColumnDto) {
        try {
            const uniqueColumn: UniqueColumn = await this.uniqueColumnRepository.findOneBy({ uniqColId: updateUniqColumn.uniqueColumnId });
            if (!uniqueColumn) throw new UnauthorizedException('invalid uniqueColumn');

            uniqueColumn.uniqColName = updateUniqColumn.uniqueColumnName
            await this.uniqueColumnRepository.save(uniqueColumn);

        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async deletUniqueColumn(id: string) {
        try {
            const uniqCol = await this.uniqueColumnRepository.findOneBy({ uniqColId: id });
            const uniqData =  await this.uniqueDataRepository.delete({ uniqueColumn: uniqCol });
            await this.uniqueColumnRepository.delete(uniqCol);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async findByEmail(email: string): Promise<Organization | undefined> {
        const organization = await this.orgRepository.findOneBy({ email: email });
        return organization;
    }

    async findById(id: string): Promise<Organization | undefined> {
        const organization = await this.orgRepository.findOneBy({ organizationId: id })
        if (!organization) throw new NotFoundException('Organization was not found');
        return organization
    }

    async deleteById(id: string): Promise<void> {
        const organization = await this.findById(id);
        await this.orgRepository.delete(organization);
    }
}
