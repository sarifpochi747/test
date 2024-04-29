import { Status } from 'src/declarations/status';
import { Camera } from 'src/entity/camera.entity';
import { CameraService } from '../camera/camera.service';
import { CameraClientLoginDto } from './dto/camera-client.dto';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class CameraClientService {

    constructor(
        private CameraService: CameraService,
        private organizationService: OrganizationService,
        @InjectRepository(Camera) private cameraRepository: Repository<Camera>,
    ) { }

    async validateCamera(requestLogin: CameraClientLoginDto): Promise<Camera | undefined> {
        try {
            const organization = await this.organizationService.findById(requestLogin.organizationId);
            const camera = await this.cameraRepository.findOneBy({ cameraId: requestLogin.cameraId , organization: organization });
            if (!camera || camera.status === Status.DISABLE) throw new NotFoundException('Camera authentication failed');
            return camera
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}
