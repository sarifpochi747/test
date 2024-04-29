import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Detection } from 'src/entity/detection.entity';
import { Repository } from 'typeorm';
import { EmbeddedService } from '../embedded/embedded.service';
import { ImgCaptureService } from '../img-capture/img-capture.service';
import { CreateDetectionDto, DetectionReqDto, EmotionGraphResDto } from './dto/detection.dto';
import { Embedded } from 'src/entity/embedded.entity';
import { HttpService } from 'src/http/http.service';
import { CameraClientDto } from '../camera-client/dto/camera-client.dto';
import { AppGateway } from 'src/app.gateway';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ImageCapture } from 'src/entity/image-capture.entity';
import { FacialAlertService } from '../facial-alert/facial-alert.service';

@Injectable()
export class DetectionService {


    constructor(
        @InjectRepository(Detection)
        private detectionRepository: Repository<Detection>,
        private facialAlertService: FacialAlertService,
        private embeddedService: EmbeddedService,
        private imageCapture: ImgCaptureService,
        private httpService: HttpService,
        private AppGateway: AppGateway,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    getTransactionGraptParameters(date: Date, currentDate: Date, filter: 'day' | 'month' | 'year', organizationId?: string) {
        let param = {}
        if (filter === 'day') {
            param = {
                startDate: date.toISOString().slice(0, 10) + ' 00:00:00',
                endDate: date.toISOString().slice(0, 10) + ' 23:59:59',
            }
        } else if (filter === 'month') {
            const dayInMonth = [31, currentDate.getFullYear() % 4 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            param = {
                startDate: date.toISOString().slice(0, 10) + ' 00:00:00',
                endDate: date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + dayInMonth[date.getMonth()] + ' 23:59:59',
            }
        } else if (filter === 'year') {
            param = {
                startDate: date.toISOString().slice(0, 10) + ' 00:00:00',
                endDate: date.getFullYear() + '-' + '12'.padStart(2, '0') + '-' + '31'.padStart(2, '0') + ' 23:59:59',
            }
        }
        if (organizationId) {
            param['organizationId'] = organizationId
        }
        return param
    }

    async getOrganizationTransaction(startDate: string, endDate: string) {
        let data = await this.detectionRepository
            .createQueryBuilder('detection')
            .select('organization.organizationName', 'organizationName')
            .addSelect('COUNT(*)', 'value')
            .leftJoin('detection.imageCapture', 'imageCapture')
            .leftJoin('imageCapture.camera', 'camera')
            .leftJoin('camera.organization', 'organization')
            .where(`(imageCapture.timeStamp BETWEEN :startDate AND :endDate)`)
            .setParameters({
                startDate: (new Date(startDate)).toISOString().slice(0, 10) + ' 00:00:00',
                endDate: (new Date(endDate)).toISOString().slice(0, 10) + ' 23:59:59',
            })
            .groupBy('organization.organizationName')
            .orderBy('value', 'DESC')
            .getRawMany();
        return data;
    }

    async getTransactionGrapt(filter: 'day' | 'month' | 'year', organizationId: string): Promise<{ [key: string]: number }[]> {
        const res = []
        let yAxis: { [key: string]: string } = { month: 'short', year: 'numeric' }
        let currentDate = new Date();
        let xAxisLabel: Date[] = []
        if (filter === 'day') {
            xAxisLabel = [
                new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 5),
                new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 4),
                new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 3),
                new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2),
                new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1),
                new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
            ]
            yAxis = { day: 'numeric' }
        } else if (filter === 'month') {
            xAxisLabel = [
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 5),
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 4),
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 3),
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 2),
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
                new Date(currentDate.getFullYear(), currentDate.getMonth()),
            ]
        } else if (filter === 'year') {
            xAxisLabel = [
                new Date(currentDate.getFullYear() - 5, currentDate.getMonth()),
                new Date(currentDate.getFullYear() - 4, currentDate.getMonth()),
                new Date(currentDate.getFullYear() - 3, currentDate.getMonth()),
                new Date(currentDate.getFullYear() - 2, currentDate.getMonth()),
                new Date(currentDate.getFullYear() - 1, currentDate.getMonth()),
                new Date(currentDate.getFullYear(), currentDate.getMonth()),
            ]
            yAxis = { year: 'numeric' }
        }
        try {
            for (const date of xAxisLabel) {
                let data = this.detectionRepository.createQueryBuilder('detection')
                    .select('detection.detectId', 'detectId')
                    .leftJoin('detection.imageCapture', 'imageCapture')
                    .leftJoin('imageCapture.camera', 'camera')
                    .leftJoin('camera.organization', 'organization')
                    .where(`(imageCapture.timeStamp BETWEEN :startDate AND :endDate)`)
                if (organizationId) {
                    data = data.andWhere(`organization.organizationId = :organizationId`)
                }
                data = data.setParameters(this.getTransactionGraptParameters(date, currentDate, filter, organizationId))
                    .groupBy('detection.detectId')
                const GraphData = {}
                GraphData[date.toLocaleDateString('en-US', yAxis)] = await data.getCount();
                res.push(GraphData)
            }
        } catch (e) {
            throw new InternalServerErrorException(e)
        }

        return res
    }

    async getEmotionGraph(startDate: string, endDate: string, organizationId: string): Promise<EmotionGraphResDto[]> {//:Promise<{[key:string]:number}[]>
        try {
            return this.detectionRepository.createQueryBuilder('detection')
                .select('detection.emotion', 'emotion')
                .addSelect('COUNT(*)', 'value')
                .leftJoin('detection.imageCapture', 'imageCapture')
                .leftJoin('imageCapture.camera', 'camera')
                .leftJoin('camera.organization', 'organization')
                .where(`(imageCapture.timeStamp BETWEEN :startDate AND :endDate)`)
                .andWhere(`organization.organizationId = :organizationId`)
                .setParameters({
                    startDate: new Date(startDate).toISOString().slice(0, 10) + ' 00:00:00',
                    endDate: new Date(endDate).toISOString().slice(0, 10) + ' 23:59:59',
                    organizationId: organizationId
                })
                .groupBy('detection.emotion')
                .addGroupBy('camera.cameraId')
                .orderBy('value', 'DESC')
                .getRawMany();
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async createDetection(requestDetection: CreateDetectionDto): Promise<void> {
        const date = new Date(requestDetection.timeStamp * 1000)
        let imgCapture: ImageCapture
        try {
            imgCapture = await this.imageCapture.createImageCapture({
                imgFile: requestDetection.imgFile,
                cameraId: requestDetection.cameraId,
                timeStamp: date
            })
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
        for (let detections of requestDetection.detectionArray) {
            let embedded: Embedded | null = null;
            if (detections.embeddedId) {
                try {
                    embedded = await this.embeddedService.findById(detections.embeddedId);
                } catch {
                    throw new InternalServerErrorException("create detection : error while seraching embedded")
                }
            }

            try {
                const detection = this.detectionRepository.create({
                    facePosition: detections.facePosition,
                    age: detections.age,
                    gender: detections.gender,
                    emotion: detections.emotion,
                    embedding: detections.embedding,
                    embedded: embedded,
                    imageCapture: imgCapture
                })

                const created = await this.detectionRepository.save(detection)
                const authCheck: CameraClientDto = await this.cacheManager.get(requestDetection.cameraId)

                this.AppGateway.server.emit(authCheck.organizationId + '-admin-detection-rtc', JSON.stringify({
                    imagecaptureId: imgCapture.imgCapId,
                    image: await this.cropImg(requestDetection.imgFile, detection.facePosition),
                    camera: detection.imageCapture.camera.cameraName,
                    name: detections.name || null,
                    gender: detection.gender,
                    age: detection.age,
                    emotion: detection.emotion,
                    dateTime: (new Date(date)).toLocaleString().replace(',', '')
                }))
            } catch (e) {
                console.error(e)
            }
        }

        for (let detections of requestDetection.alertDetectionArray) {
            this.facialAlertService.createAlertDetection(detections,imgCapture)
        }

    }

    async getAllDetection(body: DetectionReqDto, page: number, pageSize: number, imagecaptureId?: number, organizationId?: string): Promise<Detection[]> {
        if (organizationId) {
            try {
                let detection = this.detectionRepository.createQueryBuilder('detection')
                    .leftJoinAndSelect('detection.imageCapture', 'imageCapture')
                    .leftJoinAndSelect('imageCapture.camera', 'camera')
                    .leftJoinAndSelect('camera.organization', 'organization')
                    .leftJoinAndSelect('detection.embedded', 'embedded')
                    .leftJoinAndSelect('embedded.employee', 'employee')

                if (imagecaptureId) {
                    detection = detection.where(`detection."imageCaptureId" = '${imagecaptureId}'`);
                } else {
                    let querysrt = ''

                    if (body.cameraId && body.cameraId !== 'All') {
                        querysrt += ` AND camera."cameraId" = '${body.cameraId}'`
                    }

                    if (body.emotion && body.emotion !== 'Emotion') {
                        querysrt += ` AND detection."emotion" LIKE '${body.emotion}'`
                    }

                    if (body.startDate && body.endDate) {
                        querysrt += ` AND ( imageCapture.timeStamp BETWEEN '${new Date(body.startDate).toISOString().slice(0, 10)} 00:00:00' AND '${new Date(body.endDate).toISOString().slice(0, 10)} 23:59:59')`
                    }

                    detection = detection.where(`organization."organizationId" = '${organizationId}' ${querysrt}`)
                        .orWhere(`( organization."organizationId" = '${organizationId}' AND detection."embeddedId" IS NULL ${querysrt} )`);
                }

                return await detection.orderBy('imageCapture.timeStamp', 'DESC')
                    .skip((page - 1) * pageSize)
                    .take(pageSize)
                    .getMany();
            } catch (e) {
                throw new InternalServerErrorException(e)
            }
        } else {
            try {
                let detection = this.detectionRepository.createQueryBuilder('detection')
                    .leftJoinAndSelect('detection.imageCapture', 'imageCapture')
                    .leftJoinAndSelect('imageCapture.camera', 'camera')
                    .leftJoinAndSelect('camera.organization', 'organization')
                    .leftJoinAndSelect('detection.embedded', 'embedded')
                    .leftJoinAndSelect('embedded.employee', 'employee')
                if (imagecaptureId) {
                    detection = detection.where(`detection."imageCaptureId" = '${imagecaptureId}'`);
                } else {
                    let querysrt = ''

                    if (body.cameraId && body.cameraId !== 'All') {
                        querysrt += ` AND camera."cameraId" = '${body.cameraId}'`
                    }

                    if (body.emotion && body.emotion !== 'Emotion') {
                        querysrt += ` AND detection."emotion" LIKE '${body.emotion}'`
                    }

                    if (body.startDate && body.endDate) {
                        querysrt += ` AND ( imageCapture.timeStamp BETWEEN '${new Date(body.startDate).toISOString().slice(0, 10)} 00:00:00' AND '${new Date(body.endDate).toISOString().slice(0, 10)} 23:59:59')`
                    }

                    detection = detection.where(`organization."organizationId" = '${organizationId}' ${querysrt}`)
                        .orWhere(`( organization."organizationId" = '${organizationId}' AND detection."embeddedId" IS NULL ${querysrt} )`);
                }

                detection = detection.orderBy('imageCapture.timeStamp', 'DESC')
                    .skip((page - 1) * pageSize)
                    .take(pageSize)
                return await detection.getMany();

            } catch (e) {
                throw new InternalServerErrorException(e)
            }
        }
    }

    async getDetectionByImage(body: DetectionReqDto, organizationId?: string): Promise<Detection[]> {
        if (organizationId) {
            try {
                let detection = this.detectionRepository.createQueryBuilder('detection')
                    .leftJoinAndSelect('detection.imageCapture', 'imageCapture')
                    .leftJoinAndSelect('imageCapture.camera', 'camera')
                    .leftJoinAndSelect('camera.organization', 'organization')
                    .leftJoinAndSelect('detection.embedded', 'embedded')
                    .leftJoinAndSelect('embedded.employee', 'employee')

                let querysrt = ''

                if (body.cameraId && body.cameraId !== 'All') {
                    querysrt += ` AND camera."cameraId" = '${body.cameraId}'`
                }

                if (body.emotion && body.emotion !== 'Emotion') {
                    querysrt += ` AND detection."emotion" LIKE '${body.emotion}'`
                }

                if (body.startDate && body.endDate) {
                    querysrt += ` AND ( imageCapture.timeStamp BETWEEN '${new Date(body.startDate).toISOString().slice(0, 10)} 00:00:00' AND '${new Date(body.endDate).toISOString().slice(0, 10)} 23:59:59')`
                }

                detection = detection.where(`organization."organizationId" = '${organizationId}' ${querysrt}`)
                    .orWhere(`( organization."organizationId" = '${organizationId}' AND detection."embeddedId" IS NULL ${querysrt} )`);


                return await detection.orderBy('imageCapture.timeStamp', 'DESC').getMany();
            } catch (e) {
                throw new InternalServerErrorException(e)
            }
        } else {
            try {
                let detection = this.detectionRepository.createQueryBuilder('detection')
                    .leftJoinAndSelect('detection.imageCapture', 'imageCapture')
                    .leftJoinAndSelect('imageCapture.camera', 'camera')
                    .leftJoinAndSelect('camera.organization', 'organization')
                    .leftJoinAndSelect('detection.embedded', 'embedded')
                    .leftJoinAndSelect('embedded.employee', 'employee')

                let querysrt = ''

                if (body.cameraId && body.cameraId !== 'All') {
                    querysrt += ` AND camera."cameraId" = '${body.cameraId}'`
                }

                if (body.emotion && body.emotion !== 'Emotion') {
                    querysrt += ` AND detection."emotion" LIKE '${body.emotion}'`
                }

                if (body.startDate && body.endDate) {
                    querysrt += ` AND ( imageCapture.timeStamp BETWEEN '${new Date(body.startDate).toISOString().slice(0, 10)} 00:00:00' AND '${new Date(body.endDate).toISOString().slice(0, 10)} 23:59:59')`
                }

                detection = detection.where(`organization."organizationId" = '${organizationId}' ${querysrt}`)
                    .orWhere(`( organization."organizationId" = '${organizationId}' AND detection."embeddedId" IS NULL ${querysrt} )`);


                detection = detection.orderBy('imageCapture.timeStamp', 'DESC')
                return await detection.getMany();

            } catch (e) {
                throw new InternalServerErrorException(e)
            }
        }
    }

    async getDetectionSpecificMemberNumber(organizationId: string, employeeId: string): Promise<number> {
        try {
            return await this.detectionRepository.createQueryBuilder('detection')
                .leftJoinAndSelect('detection.imageCapture', 'imageCapture')
                .leftJoinAndSelect('imageCapture.camera', 'camera')
                .leftJoinAndSelect('camera.organization', 'organization')
                .leftJoinAndSelect('detection.embedded', 'embedded')
                .leftJoinAndSelect('embedded.employee', 'employee')
                .where(`embedded."employeeId" = '${employeeId}'`)
                .andWhere(`organization."organizationId" = '${organizationId}'`)
                .getCount();
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getDetectionSpecificMember(page: number, pageSize: number, organizationId: string, employeeId: string): Promise<Detection[]> {
        try {
            return await this.detectionRepository.createQueryBuilder('detection')
                .leftJoinAndSelect('detection.imageCapture', 'imageCapture')
                .leftJoinAndSelect('imageCapture.camera', 'camera')
                .leftJoinAndSelect('camera.organization', 'organization')
                .leftJoinAndSelect('detection.embedded', 'embedded')
                .leftJoinAndSelect('embedded.employee', 'employee')
                .where(`embedded."employeeId" = '${employeeId}'`)
                .andWhere(`organization."organizationId" = '${organizationId}'`)
                .orderBy('imageCapture.timeStamp', 'DESC')
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getMany();
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async getDectionNumber(body: DetectionReqDto, organizationId: string, imagecaptureId?: number): Promise<Number> {
        if (organizationId) {
            try {
                let detection = this.detectionRepository.createQueryBuilder('detection')
                    .leftJoinAndSelect('detection.imageCapture', 'imageCapture')
                    .leftJoinAndSelect('imageCapture.camera', 'camera')
                    .leftJoinAndSelect('camera.organization', 'organization')
                    .leftJoinAndSelect('detection.embedded', 'embedded')
                    .leftJoinAndSelect('embedded.employee', 'employee')
                if (imagecaptureId) {
                    detection = detection.where(`detection."imageCaptureId" = '${imagecaptureId}'`);
                } else {
                    let querysrt = ''

                    if (body.cameraId && body.cameraId !== 'All') {
                        querysrt += ` AND camera."cameraId" = '${body.cameraId}'`
                    }

                    if (body.emotion && body.emotion !== 'Emotion') {
                        querysrt += ` AND detection."emotion" LIKE '${body.emotion}'`
                    }

                    if (body.startDate && body.endDate) {
                        querysrt += ` AND ( imageCapture.timeStamp BETWEEN '${new Date(body.startDate).toISOString().slice(0, 10)} 00:00:00' AND '${new Date(body.endDate).toISOString().slice(0, 10)} 23:59:59')`
                    }

                    detection = detection.where(`organization."organizationId" = '${organizationId}' ${querysrt}`)
                        .orWhere(`( organization."organizationId" = '${organizationId}' AND detection."embeddedId" IS NULL ${querysrt} )`);
                }
                return await detection.getCount();
            } catch (e) {
                throw new InternalServerErrorException(e)
            }
        } else {
            try {
                let detection = this.detectionRepository.createQueryBuilder('detection')
                    .leftJoinAndSelect('detection.imageCapture', 'imageCapture')
                    .leftJoinAndSelect('imageCapture.camera', 'camera')
                    .leftJoinAndSelect('camera.organization', 'organization')
                    .leftJoinAndSelect('detection.embedded', 'embedded')
                    .leftJoinAndSelect('embedded.employee', 'employee')
                if (imagecaptureId) {
                    detection = detection.where(`detection."imageCaptureId" = '${imagecaptureId}'`);
                } else {
                    let querysrt = ''

                    if (body.cameraId && body.cameraId !== 'All') {
                        querysrt += ` AND camera."cameraId" = '${body.cameraId}'`
                    }

                    if (body.emotion && body.emotion !== 'Emotion') {
                        querysrt += ` AND detection."emotion" LIKE '${body.emotion}'`
                    }

                    if (body.startDate && body.endDate) {
                        querysrt += ` AND ( imageCapture.timeStamp BETWEEN '${new Date(body.startDate).toISOString().slice(0, 10)} 00:00:00' AND '${new Date(body.endDate).toISOString().slice(0, 10)} 23:59:59')`
                    }

                    detection = detection.where(`organization."organizationId" = '${organizationId}' ${querysrt}`)
                        .orWhere(`( organization."organizationId" = '${organizationId}' AND detection."embeddedId" IS NULL ${querysrt} )`);
                }
                return await detection.getCount();
            } catch (e) {
                throw new InternalServerErrorException(e)
            }
        }
    }

    async cropImg(imgB64: string, region: string): Promise<string> {
        try {
            return await this.httpService.post('/crop-image', { imgB64: imgB64, region: region })
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}
