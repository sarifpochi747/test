import { Module } from '@nestjs/common';
import { FacialAlertService } from './facial-alert.service';
import { FacialAlertController } from './facial-alert.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from 'src/entity/alert.entity';
import { AlertDetection } from 'src/entity/alert-detection.entity';
import { Organization } from 'src/entity/organization.entity';
import { ImageCapture } from 'src/entity/image-capture.entity';
import { Camera } from 'src/entity/camera.entity';
import { Repository } from 'typeorm';
import { DetectionService } from '../detection/detection.service';
import { OrganizationService } from '../organization/organization.service';
import { AppGateway } from 'src/app.gateway';
import { Detection } from 'src/entity/detection.entity';
import { EmbeddedService } from '../embedded/embedded.service';
import { ImgCaptureService } from '../img-capture/img-capture.service';
import { HttpService } from 'src/http/http.service';
import { UniqueColumn } from 'src/entity/unique-column.entity';
import { Embedded } from 'src/entity/embedded.entity';
import { Employee } from 'src/entity/employee.entity';
import { EmployeeService } from '../employee/employee.service';
import { CameraService } from '../camera/camera.service';
import { UniqueData } from 'src/entity/unique-data.entity';


@Module({
  imports: [TypeOrmModule.forFeature([
    Alert,
    AlertDetection,
    Organization,
    ImageCapture,
    Camera,
    Detection,
    UniqueColumn,
    UniqueData,
    Embedded,
    Employee
  ])],

  controllers: [FacialAlertController],
  providers: [
    FacialAlertService,
    Repository,
    DetectionService,
    OrganizationService,
    AppGateway,
    EmbeddedService,
    ImgCaptureService,
    HttpService,
    EmployeeService,
    CameraService
  ],
})
export class FacialAlertModule { }
