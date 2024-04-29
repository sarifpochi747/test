import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ImgCaptureController } from './img-capture.controller';
import { ImgCaptureService } from './img-capture.service';
import { Detection } from 'src/entity/detection.entity';
import { Camera } from 'src/entity/camera.entity';
import { ImageCapture } from 'src/entity/image-capture.entity';
import { CameraService } from '../camera/camera.service';
import { OrganizationService } from '../organization/organization.service';
import { Organization } from 'src/entity/organization.entity';
import { UniqueColumn } from 'src/entity/unique-column.entity';
import { Repository } from 'typeorm';
import { AppGateway } from 'src/app.gateway';
import { UniqueData } from 'src/entity/unique-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Camera,
    ImageCapture,
    Detection,
    Organization,
    UniqueColumn,
    UniqueData,
    AppGateway
  ]),
  PassportModule.register({
    session: true
  })
  ],
  controllers: [ImgCaptureController],
  providers: [ImgCaptureService, CameraService, OrganizationService, Repository,AppGateway]
})
export class ImgCaptureModule { }
