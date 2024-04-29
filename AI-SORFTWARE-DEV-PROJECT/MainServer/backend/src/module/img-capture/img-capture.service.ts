import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageCapture } from 'src/entity/image-capture.entity';
import { Repository } from 'typeorm';
import { CameraService } from '../camera/camera.service';
import { ImageCaptureDTO } from './dto/img-capture.dto';

@Injectable()
export class ImgCaptureService {


    constructor(@InjectRepository(ImageCapture)
    private imageCaptureRepository: Repository<ImageCapture>,
        private cameraService: CameraService
    ) { }

    async getImageCaptureId(imagecaptureId: number) {

        try {
            return await this.imageCaptureRepository.createQueryBuilder('image_capture')
            .leftJoinAndSelect("image_capture.camera", "camera")
            .where("image_capture.imgCapId = :imgCapId", { imgCapId: imagecaptureId })
            .getOne();
        } catch (e) {
            throw new InternalServerErrorException("create image capture : error while saving image")
        }
    }

    async getImageSurroundingRows(imagecaptureId: number,cameraId:string) {

        const imageCapturesBefore = await this.imageCaptureRepository
            .createQueryBuilder('image_capture')
            .leftJoinAndSelect("image_capture.camera", "camera")
            .where("image_capture.imgCapId < :imgCapId", { imgCapId: imagecaptureId })
            .andWhere("camera.cameraId = :cameraId", { cameraId: cameraId })
            .orderBy("image_capture.imgCapId", "DESC")
            .take(5)
            .getMany();
    
        const imageCapturesAfter = await this.imageCaptureRepository
            .createQueryBuilder('image_capture')
            .leftJoinAndSelect("image_capture.camera", "camera")
            .where("image_capture.imgCapId > :imgCapId", { imgCapId: imagecaptureId })
            .andWhere("camera.cameraId = :cameraId", { cameraId: cameraId })
            .orderBy("image_capture.imgCapId", "ASC")
            .take(5)
            .getMany();
    
        return {
            imageCapturesBefore:imageCapturesBefore,
            imageCapturesAfter:imageCapturesAfter
        };
    }
    

    async createImageCapture(requestImageCapture: ImageCaptureDTO): Promise<ImageCapture> {
        let camera = null

        try {
            camera = await this.cameraService.findById(requestImageCapture.cameraId);
        } catch {
            throw new InternalServerErrorException("create image capture : error while seraching camera")
        }
        if (!camera) {
            throw new NotFoundException("create image capture : camera not found")
        }

        try {
            const imgCap = this.imageCaptureRepository.create({
                imgFile: requestImageCapture.imgFile,
                timeStamp: requestImageCapture.timeStamp,
                camera: camera,
            })
            return await this.imageCaptureRepository.save(imgCap)
        } catch (e) {
            throw new InternalServerErrorException("create image capture : error while saving image")
        }

    }


    async getImageCaptureByIdCamera(cameraId: string): Promise<ImageCapture[]> {
        const camera = await this.cameraService.findById(cameraId);

        if (!camera) throw new NotFoundException("Camera was not found");

        return await this.imageCaptureRepository.find({
            where: {
                camera: camera
            }
        });
    }

    async findById(id: number): Promise<ImageCapture> {
        return await this.imageCaptureRepository.findOneBy({ imgCapId: id });
    }



}
