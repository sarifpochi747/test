import { Repository } from 'typeorm';
import { Cache } from "cache-manager";
import { Status } from 'src/declarations/status';
import { Camera } from 'src/entity/camera.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Organization } from 'src/entity/organization.entity';
import { OrganizationService } from '../organization/organization.service';
import { AdminUpdateCameraDto, CameraDto, systemAdminUpdateCameraDto } from './dto/camera.dto';
import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

@Injectable()
export class CameraService {
    constructor(
        private organizationService: OrganizationService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectRepository(Camera) private cameraRepository: Repository<Camera>,
    ) { }

    async createCamera(requestCamera: CameraDto): Promise<void> {
        let organization: Organization
        try {
            organization = await this.organizationService.findById(requestCamera.organizationId);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }

        if (!organization) throw new NotFoundException("organization was not found")

        try {
            const camera = this.cameraRepository.create({
                cameraName: requestCamera.cameraName,
                cameraSpec: requestCamera.cameraSpec,
                cameraDetail: requestCamera.cameraDetail,
                dateInstall: new Date(requestCamera.dateInstall),
                status: 'Active',
                organization: organization
            })
            await this.cameraRepository.save(camera)
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getCameraNumber(organizationId?: string, filter?: string): Promise<number> {
        if (organizationId) {
            try {
                const organization = await this.organizationService.findById(organizationId);
                if (!organization) throw new NotFoundException("organization was not found")
                let query = this.cameraRepository
                    .createQueryBuilder('camera')
                    .leftJoinAndSelect('camera.organization', 'organization')
                    .where(`organization."organizationId" = '${organizationId}'`)

                if (filter) {
                    query = query.andWhere(`camera."cameraName" LIKE '%${filter}%'`)
                }

                return await query.getCount()
            } catch (e) {
                throw new InternalServerErrorException(e)
            }
        }

        try {
            let query = this.cameraRepository
                .createQueryBuilder('camera')
                .leftJoinAndSelect('camera.organization', 'organization')
            if (filter) {
                query = query.andWhere(`camera."cameraName" = '%${filter}%'`)
            }
            return await query.getCount()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getAllCamera(page: number, pageSize: number, organizationId?: string, filter?: string): Promise<Camera[]> {
        if (organizationId) {
            try {
                const organization = await this.organizationService.findById(organizationId);
                if (!organization) throw new NotFoundException("organization was not found")
                let query = this.cameraRepository
                    .createQueryBuilder('camera')
                    .leftJoinAndSelect('camera.organization', 'organization')
                    .where(`organization."organizationId" = '${organizationId}'`)

                if (filter) {
                    query = query.andWhere(`camera."cameraName" LIKE '%${filter}%'`)
                }

                return await query.skip((page - 1) * pageSize).take(pageSize).getMany()
            } catch (e) {
                throw new InternalServerErrorException(e)
            }

        }

        try {
            let query = this.cameraRepository
                .createQueryBuilder('camera')
                .leftJoinAndSelect('camera.organization', 'organization')
            if (filter) {
                query = query.andWhere(`camera."cameraName" LIKE '%${filter}%'`)
                query = query.orWhere(`organization."organizationName" LIKE '%${filter}%'`)
            }
            return await query.skip((page - 1) * pageSize).take(pageSize).getMany()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async updateCamera(updateCamera: systemAdminUpdateCameraDto): Promise<void> {
        try {
            const camera = await this.findById(updateCamera.cameraId);
            if (!camera) throw new NotFoundException("Camera not found");

            if (updateCamera.cameraName) camera.cameraName = updateCamera.cameraName;
            if (updateCamera.cameraSpec) camera.cameraSpec = updateCamera.cameraSpec;
            if (updateCamera.cameraDetail) camera.cameraDetail = updateCamera.cameraDetail;
            if (updateCamera.dateInstall) camera.dateInstall = new Date(updateCamera.dateInstall);

            if (updateCamera.status) {
                camera.status = updateCamera.status;
                if (updateCamera.status === Status.DISABLE) {
                    await this.cacheManager.del(`${camera.cameraId}`);
                }
            }

            await this.cameraRepository.save(camera);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async adminUpdateCamera(updateCamera: AdminUpdateCameraDto): Promise<void> {
        try {
            const camera = await this.findById(updateCamera.cameraId);

            if (!camera) throw new NotFoundException("Camera not found");
            camera.cameraName = updateCamera.cameraName;
            camera.cameraDetail = updateCamera.cameraDetail;
            await this.cameraRepository.save(camera);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async deleteCamera(id: string): Promise<void> {
        let camera: Camera;
        try {
            camera = await this.findById(id);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }

        if (!camera) throw new BadRequestException("camera is not available");

        try {
            await this.cameraRepository.delete(id);
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async findById(id: string): Promise<Camera | undefined> {
        try {
            return await this.cameraRepository.findOneBy({ cameraId: id });
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}
