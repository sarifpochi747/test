import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { OrganizationService } from '../organization/organization.service';
import { Alert } from 'src/entity/alert.entity';
import { Repository } from 'typeorm';
import { CreateAlertDetectionDto, CreateAlertDto } from './dto/facial-alert.dto';
import { Organization } from 'src/entity/organization.entity';
import { EmbeddedService } from '../embedded/embedded.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertDetection } from 'src/entity/alert-detection.entity';
import { ImageCapture } from 'src/entity/image-capture.entity';
import { ImgCaptureService } from '../img-capture/img-capture.service';
import { AppGateway } from 'src/app.gateway';
import { HttpService } from 'src/http/http.service';

@Injectable()
export class FacialAlertService {
    constructor(
        @InjectRepository(Alert)
        private alertRepository: Repository<Alert>,
        @InjectRepository(AlertDetection)
        private alertDetectionRepository: Repository<AlertDetection>,
        private embeddedService: EmbeddedService,
        private organizationService: OrganizationService,
        private imageCapture: ImgCaptureService,
        private AppGateway: AppGateway,
        private httpService: HttpService,
    ) { }

    async getAlertNumber(organizationId: string): Promise<Number> {
        try {
            return await this.alertRepository.createQueryBuilder('alert')
                .where("alert." + '"organizationId" =' + "'" + organizationId + "'")
                .getCount();
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getAllAlert(page: number, pageSize: number, organizationId: string): Promise<Alert[]> {
        try {
            return await this.alertRepository.createQueryBuilder('alert')
                .select(['alert.alertId', 'alert.alertName', 'alert.timeStamp', 'alert.imgFile',])
                .where("alert." + '"organizationId" =' + "'" + organizationId + "'")
                .orderBy('alert.timeStamp', 'DESC')
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getMany();
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async camGetAlert(organizationId: string): Promise<Alert[]> {
        try {
            return await this.alertRepository.createQueryBuilder('alert')
                .select(['alert.alertId', 'alert.embedding',])
                .where("alert." + '"organizationId" =' + "'" + organizationId + "'")
                .orderBy('alert.timeStamp', 'DESC')
                .getMany();
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getAlertDetection(page: number, pageSize: number, alertId: string): Promise<AlertDetection[]> {
        try {
            return await this.alertDetectionRepository.createQueryBuilder('alert_detection')
                .leftJoinAndSelect('alert_detection.imageCapture', 'imageCapture')
                .leftJoinAndSelect('imageCapture.camera', 'camera')
                .where(`alert_detection."alertId" = '${alertId}'`)
                .orderBy('imageCapture.timeStamp', 'DESC')
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getMany();
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getAlertDetectionNumber(alertId: string): Promise<Number> {
        try {
            return await this.alertDetectionRepository.createQueryBuilder('alert_detection')
                .leftJoinAndSelect('alert_detection.imageCapture', 'imageCapture')
                .leftJoinAndSelect('imageCapture.camera', 'camera')
                .where(`alert_detection."alertId" = '${alertId}'`)
                .getCount();
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getSpecificAlert(id: number): Promise<Alert> {
        try {
            return await this.alertRepository.createQueryBuilder('alert')
                .select(['alert.alertId', 'alert.alertName', 'alert.timeStamp', 'alert.imgFile',])
                .where("alert." + '"alertId"  =' + "'" + id + "'")
                .getOne();
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async createAlert(createAlertDto: CreateAlertDto, orgId: string): Promise<Alert> {
        let organization: Organization | null = null;

        try {
            organization = await this.organizationService.findById(orgId);
        } catch {
            throw new InternalServerErrorException("create alert : error while seraching organization")
        }

        if (!organization) throw new NotFoundException("organization id : was not found")
        const predEmc = await this.embeddedService.predictEmbedded(createAlertDto.imgFile)
        const detection = this.alertRepository.create({
            alertName: createAlertDto.alertName,
            timeStamp: new Date(),
            embedding: predEmc,
            imgFile: createAlertDto.imgFile,
            organization: organization,
        })

        try {
            return await this.alertRepository.save(detection)
        } catch (e) {
            throw new InternalServerErrorException(`create alert :${e}`)
        }
    }

    async createAlertDetection( requestDetection: CreateAlertDetectionDto,imgCapture: ImageCapture = null): Promise<void> {
        const date = new Date(imgCapture.timeStamp)
        if (!imgCapture) {
            try {
                imgCapture = await this.imageCapture.createImageCapture({
                    imgFile: requestDetection.imgFile,
                    cameraId: requestDetection.cameraId,
                    timeStamp: date
                })
            } catch (e) {
                throw new InternalServerErrorException(e)
            }
        }


        for (let detections of requestDetection.detectionArray) {
            const alert = await this.alertRepository.findOneBy({ alertId: requestDetection.alertId })
            const detection = this.alertDetectionRepository.create({
                Alert: alert,
                facePosition: detections,
                imageCapture: imgCapture
            })
            this.alertDetectionRepository.save(detection)
            try {
                this.AppGateway.server.emit(requestDetection.organizationId + '-admin-listening-alert', JSON.stringify({
                    id: alert.alertId,
                    image: 'data:image/png;base64,' +imgCapture.imgFile,
                    imageId: imgCapture.imgCapId,
                    camera: detection.imageCapture.camera.cameraName,
                    dateDetected: (new Date(date)).toLocaleString().replace(',', '')
                }))
            } catch (e) {
                console.error(e)
            }
            try {
                this.AppGateway.server.emit(requestDetection.organizationId + '-admin-alert-detection-rtc'+alert.alertId, JSON.stringify({
                    id: alert.alertId,
                    image: 'data:image/png;base64,' +imgCapture.imgFile,
                    imageId: imgCapture.imgCapId,
                    camera: detection.imageCapture.camera.cameraName,
                    dateDetected: (new Date(date)).toLocaleString().replace(',', '')
                }))
            } catch (e) {
                console.error(e)
            }
        }
    }

    async deleteAlertById(alertId: number): Promise<Alert> {
        try {
            const alert = await this.findById(alertId);
            this.alertDetectionRepository.delete({ Alert: alert })
            const del = await this.alertRepository.delete(alertId);
            return alert
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async findById(id: number): Promise<Alert | undefined> {
        const alert = await this.alertRepository.findOneBy({ alertId: id })
        if (!alert) throw new NotFoundException('Organization was not found');
        return alert
    }

    async cropImg(imgB64: string, region: string): Promise<string> {
        try {
            return await this.httpService.post('/crop-image', { imgB64: imgB64, region: region })
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

}
